import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '@/context/language-context';
import { MAX_IMAGES_PER_POST, remainingImageSlots } from '@/lib/post-limits';
import { useState } from 'react';
import { Alert } from 'react-native';

export interface SelectedImage {
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string | null;
}

export function useImagePicker() {
    const { t } = useLanguage();
    const [images, setImages] = useState<SelectedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                t('common.permissionRequired'),
                t('errors.permissionPhotos')
            );
            return false;
        }
        return true;
    };

    const showLimitReached = () => {
        Alert.alert(t('common.info'), t('create.maxImages', { count: MAX_IMAGES_PER_POST }));
    };

    // Strip EXIF metadata and re-encode as JPEG
    const processAsset = async (asset: ImagePicker.ImagePickerAsset): Promise<SelectedImage> => {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        return {
            uri: manipulatedImage.uri,
            width: manipulatedImage.width,
            height: manipulatedImage.height,
            type: asset.type,
            fileName: asset.fileName,
        };
    };

    // New photos go after the existing ones and never past the limit. Functional update, so a
    // photo added while another pick was processing is not lost.
    const appendImages = (newImages: SelectedImage[]) => {
        setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES_PER_POST));
    };

    const pickMultipleImages = async () => {
        const remaining = remainingImageSlots(images.length);
        // selectionLimit 0 means "no limit" to expo-image-picker, so a full post never opens it
        if (remaining === 0) {
            showLimitReached();
            return;
        }

        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        setIsLoading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: remaining,
            });

            if (!result.canceled && result.assets.length > 0) {
                // Older Android pickers can ignore selectionLimit
                const assets = result.assets.slice(0, remaining);
                const processedImages: SelectedImage[] = [];
                for (const asset of assets) {
                    processedImages.push(await processAsset(asset));
                }
                appendImages(processedImages);

                if (result.assets.length > remaining) {
                    showLimitReached();
                }
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert(t('common.error'), t('errors.imagesPickFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const takePhoto = async () => {
        if (remainingImageSlots(images.length) === 0) {
            showLimitReached();
            return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                t('common.permissionRequired'),
                t('errors.permissionCamera')
            );
            return;
        }

        setIsLoading(true);
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                appendImages([await processAsset(result.assets[0])]);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert(t('common.error'), t('errors.photoCaptureFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const clearImages = () => {
        setImages([]);
    };

    return {
        images,
        setImages,
        isLoading,
        pickMultipleImages,
        takePhoto,
        removeImage,
        clearImages,
    };
}
