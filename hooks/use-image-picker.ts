import * as ImagePicker from 'expo-image-picker';
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
    const [images, setImages] = useState<SelectedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera roll permissions to upload images.'
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        setIsLoading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const newImage: SelectedImage = {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    type: asset.type,
                    fileName: asset.fileName,
                };
                setImages([...images, newImage]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const pickMultipleImages = async (maxImages: number = 5) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        setIsLoading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: maxImages,
            });

            if (!result.canceled && result.assets.length > 0) {
                const newImages: SelectedImage[] = result.assets.map((asset: ImagePicker.ImagePickerAsset) => ({
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    type: asset.type,
                    fileName: asset.fileName,
                }));
                setImages([...images, ...newImages].slice(0, maxImages));
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Sorry, we need camera permissions to take photos.'
            );
            return;
        }

        setIsLoading(true);
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const newImage: SelectedImage = {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    type: asset.type,
                    fileName: asset.fileName,
                };
                setImages([...images, newImage]);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const clearImages = () => {
        setImages([]);
    };

    return {
        images,
        isLoading,
        pickImage,
        pickMultipleImages,
        takePhoto,
        removeImage,
        clearImages,
    };
}
