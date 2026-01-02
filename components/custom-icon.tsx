/**
 * Custom SVG Icon Component
 * Uses project's custom icon set from assets/icons
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

// Import all SVG icons
import AirplaneIcon from '@/assets/icons/airplane.svg';
import BackArrowIcon from '@/assets/icons/back-arrow-pointing-left.svg';
import BeachIcon from '@/assets/icons/beach-umbrella-island.svg';
import BellIcon from '@/assets/icons/bell-notification.svg';
import BookmarkIcon from '@/assets/icons/bookmark-save-ribbon.svg';
import CameraIcon from '@/assets/icons/camera-icon.svg';
import CheckIcon from '@/assets/icons/check-checkmark-tick.svg';
import CityIcon from '@/assets/icons/city-buildings-skyline.svg';
import CloseIcon from '@/assets/icons/close-x-cross.svg';
import CommentIcon from '@/assets/icons/comment-chat-bubble.svg';
import CompassIcon from '@/assets/icons/compass.svg';
import CreateIcon from '@/assets/icons/create-plus-add.svg';
import EditIcon from '@/assets/icons/edit-pencil.svg';
import ExploreIcon from '@/assets/icons/explore-discover-compass.svg';
import ForestIcon from '@/assets/icons/forest-trees-nature.svg';
import GalleryIcon from '@/assets/icons/gallery-image-grid.svg';
import GlobeIcon from '@/assets/icons/globe-earth-world.svg';
import HeartIcon from '@/assets/icons/heart-like.svg';
import HomeIcon from '@/assets/icons/home-house.svg';
import LogoutIcon from '@/assets/icons/logout-exit-door.svg';
import MapPinIcon from '@/assets/icons/map-pin-location-marker.svg';
import MoreIcon from '@/assets/icons/more-options-three-dots-menu.svg';
import MountainIcon from '@/assets/icons/mountain-peak.svg';
import PassportIcon from '@/assets/icons/passport-booklet.svg';
import SearchIcon from '@/assets/icons/search-magnifying-glass.svg';
import SettingsIcon from '@/assets/icons/settings-gear.svg';
import ShareIcon from '@/assets/icons/share-icon-with-arrows.svg';
import SuitcaseIcon from '@/assets/icons/suitcase-luggage.svg';
import UserIcon from '@/assets/icons/user-profile-person.svg';

// Icon name type
export type IconName =
    | 'airplane'
    | 'back-arrow'
    | 'beach'
    | 'bell'
    | 'bookmark'
    | 'camera'
    | 'check'
    | 'city'
    | 'close'
    | 'comment'
    | 'compass'
    | 'create'
    | 'edit'
    | 'explore'
    | 'forest'
    | 'gallery'
    | 'globe'
    | 'heart'
    | 'home'
    | 'logout'
    | 'map-pin'
    | 'more'
    | 'mountain'
    | 'passport'
    | 'search'
    | 'settings'
    | 'share'
    | 'suitcase'
    | 'user';

// Icon registry mapping names to components
const iconRegistry: Record<IconName, React.FC<SvgProps>> = {
    'airplane': AirplaneIcon,
    'back-arrow': BackArrowIcon,
    'beach': BeachIcon,
    'bell': BellIcon,
    'bookmark': BookmarkIcon,
    'camera': CameraIcon,
    'check': CheckIcon,
    'city': CityIcon,
    'close': CloseIcon,
    'comment': CommentIcon,
    'compass': CompassIcon,
    'create': CreateIcon,
    'edit': EditIcon,
    'explore': ExploreIcon,
    'forest': ForestIcon,
    'gallery': GalleryIcon,
    'globe': GlobeIcon,
    'heart': HeartIcon,
    'home': HomeIcon,
    'logout': LogoutIcon,
    'map-pin': MapPinIcon,
    'more': MoreIcon,
    'mountain': MountainIcon,
    'passport': PassportIcon,
    'search': SearchIcon,
    'settings': SettingsIcon,
    'share': ShareIcon,
    'suitcase': SuitcaseIcon,
    'user': UserIcon,
};

export interface CustomIconProps {
    name: IconName;
    size?: number;
    color?: string;
    style?: object;
}

/**
 * CustomIcon - Renders custom SVG icons from the project's icon set
 * 
 * @example
 * <CustomIcon name="home" size={24} color="#2C1810" />
 * <CustomIcon name="compass" size={28} />
 */
export function CustomIcon({
    name,
    size = 24,
    color,
    style
}: CustomIconProps) {
    const IconComponent = iconRegistry[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in icon registry`);
        return null;
    }

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            <IconComponent
                width={size}
                height={size}
                fill={color}
                color={color}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

// Export all icons for direct usage if needed
export {
    AirplaneIcon,
    BackArrowIcon,
    BeachIcon,
    BellIcon,
    BookmarkIcon,
    CameraIcon,
    CheckIcon,
    CityIcon,
    CloseIcon,
    CommentIcon,
    CompassIcon,
    CreateIcon,
    EditIcon,
    ExploreIcon,
    ForestIcon,
    GalleryIcon,
    GlobeIcon,
    HeartIcon,
    HomeIcon,
    LogoutIcon,
    MapPinIcon,
    MoreIcon,
    MountainIcon,
    PassportIcon,
    SearchIcon,
    SettingsIcon,
    ShareIcon,
    SuitcaseIcon,
    UserIcon
};

export default CustomIcon;
