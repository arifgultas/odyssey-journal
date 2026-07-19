const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tkamxnpayxqxymjtpnef.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYW14bnBheXhxeHltanRwbmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTQ4OTgsImV4cCI6MjA5MTU3MDg5OH0.pg7xSscMX-bw8CuV49fSsVewdkCdLzbv2MbiH_DQrG4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fix() {
    try {
        console.log('--- Fetching posts where location_name is null but location exists ---');
        const { data: posts, error } = await supabase
            .from('posts')
            .select('id, title, location')
            .is('location_name', null)
            .not('location', 'is', null);

        if (error) throw error;

        console.log(`Found ${posts.length} posts to fix.`);

        for (const post of posts) {
            const loc = post.location;
            let locationName = null;
            if (loc) {
                if (loc.city && loc.country) {
                    locationName = `${loc.city}, ${loc.country}`;
                } else if (loc.city) {
                    locationName = loc.city;
                } else if (loc.country) {
                    locationName = loc.country;
                } else if (loc.address) {
                    locationName = loc.address;
                } else if (loc.name) {
                    locationName = loc.name;
                }
            }

            if (locationName) {
                console.log(`Updating post "${post.title}" (ID: ${post.id}) -> location_name: "${locationName}"`);
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({ location_name: locationName })
                    .eq('id', post.id);

                if (updateError) {
                    console.error(`Failed to update post ${post.id}:`, updateError);
                } else {
                    console.log(`Successfully updated post ${post.id}`);
                }
            }
        }

        console.log('Migration complete!');
    } catch (e) {
        console.error('Error migrating:', e);
    }
}

fix();
