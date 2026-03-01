// Supabase Edge Function: AI Content Moderation
// Uses OpenAI Moderation API (free) to screen text and images
//
// Deploy: supabase functions deploy moderate-content
// Requires: OPENAI_API_KEY set via supabase secrets

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations";

interface ModerationRequest {
    text?: string;
    imageUrls?: string[];
}

interface ModerationCategory {
    flagged: boolean;
    categories: Record<string, boolean>;
    categoryScores: Record<string, number>;
}

interface ModerationResponse {
    approved: boolean;
    flaggedCategories: string[];
    details: {
        textResult?: ModerationCategory;
        imageResults?: ModerationCategory[];
    };
}

/**
 * Moderate text content using OpenAI Moderation API
 */
async function moderateText(
    text: string,
    apiKey: string
): Promise<ModerationCategory> {
    const response = await fetch(OPENAI_MODERATION_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "omni-moderation-latest",
            input: [{ type: "text", text }],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const result = data.results[0];

    return {
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
    };
}

/**
 * Moderate image content using OpenAI Moderation API (omni model)
 */
async function moderateImage(
    imageUrl: string,
    apiKey: string
): Promise<ModerationCategory> {
    const response = await fetch(OPENAI_MODERATION_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "omni-moderation-latest",
            input: [
                {
                    type: "image_url",
                    image_url: { url: imageUrl },
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const result = data.results[0];

    return {
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
    };
}

/**
 * Extract human-readable category names from flagged categories
 */
function getFlaggedCategoryNames(categories: Record<string, boolean>): string[] {
    const categoryLabels: Record<string, string> = {
        "sexual": "Sexual Content",
        "sexual/minors": "Sexual Content (Minors)",
        "harassment": "Harassment",
        "harassment/threatening": "Threatening Harassment",
        "hate": "Hate Speech",
        "hate/threatening": "Threatening Hate Speech",
        "illicit": "Illicit Content",
        "illicit/violent": "Violent Illicit Content",
        "self-harm": "Self-Harm",
        "self-harm/intent": "Self-Harm Intent",
        "self-harm/instructions": "Self-Harm Instructions",
        "violence": "Violence",
        "violence/graphic": "Graphic Violence",
    };

    return Object.entries(categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => categoryLabels[category] || category);
}

Deno.serve(async (req) => {
    // CORS headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const apiKey = Deno.env.get("OPENAI_API_KEY");
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY is not configured");
        }

        // Verify the request is from an authenticated user
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const authHeader = req.headers.get("Authorization");

        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse request
        const { text, imageUrls } = (await req.json()) as ModerationRequest;

        if (!text && (!imageUrls || imageUrls.length === 0)) {
            return new Response(
                JSON.stringify({ error: "No content to moderate" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const result: ModerationResponse = {
            approved: true,
            flaggedCategories: [],
            details: {},
        };

        // Moderate text if provided
        if (text && text.trim().length > 0) {
            const textResult = await moderateText(text, apiKey);
            result.details.textResult = textResult;

            if (textResult.flagged) {
                result.approved = false;
                result.flaggedCategories.push(
                    ...getFlaggedCategoryNames(textResult.categories)
                );
            }
        }

        // Moderate images if provided
        if (imageUrls && imageUrls.length > 0) {
            const imageResults: ModerationCategory[] = [];

            for (const url of imageUrls) {
                try {
                    const imageResult = await moderateImage(url, apiKey);
                    imageResults.push(imageResult);

                    if (imageResult.flagged) {
                        result.approved = false;
                        const newCategories = getFlaggedCategoryNames(imageResult.categories);
                        for (const cat of newCategories) {
                            if (!result.flaggedCategories.includes(cat)) {
                                result.flaggedCategories.push(cat);
                            }
                        }
                    }
                } catch (imgError) {
                    console.error(`Failed to moderate image: ${url}`, imgError);
                    // Don't block the entire post if one image moderation fails
                    imageResults.push({
                        flagged: false,
                        categories: {},
                        categoryScores: {},
                    });
                }
            }

            result.details.imageResults = imageResults;
        }

        return new Response(
            JSON.stringify(result),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Moderation error:", error);
        return new Response(
            JSON.stringify({
                approved: true, // Fail-open: allow content if moderation service fails
                error: (error as Error).message,
            }),
            {
                status: 200, // Return 200 even on error so the post isn't blocked by infrastructure issues
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
