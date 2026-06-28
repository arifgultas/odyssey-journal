import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface CategoryIconProps {
    icon: string;
    color: string;
    size?: number;
}

export function CategoryIcon({ icon, color, size = 20 }: CategoryIconProps) {
    switch (icon) {
        case 'tree':
        case 'nature':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path d="M12 3 L15.5 10 H13.5 L17 17 H7 L10.5 10 H8.5 L12 3 Z" strokeLinejoin="round" />
                    <Path d="M12 21 V17" strokeLinecap="round" />
                </Svg>
            );
        case 'history':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path d="M5 2h14" strokeLinecap="round" />
                    <Path d="M5 22h14" strokeLinecap="round" />
                    <Path d="M19 2l-7 8-7-8" strokeLinejoin="round" />
                    <Path d="M19 22l-7-8-7 8" strokeLinejoin="round" />
                    <Circle cx={12} cy={18} r={1.5} fill={color} />
                </Svg>
            );
        case 'city':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path d="M3 21h18" strokeLinecap="round" />
                    <Path d="M5 21V10l3-3 3 3v11" strokeLinejoin="round" />
                    <Path d="M13 21V7l3-3 4 3v14" strokeLinejoin="round" />
                    <Rect x={15} y={11} width={2} height={2} fill="none" />
                    <Rect x={15} y={15} width={2} height={2} fill="none" />
                </Svg>
            );
        case 'food':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path d="M3 19h18" strokeLinecap="round" />
                    <Path d="M4 19a8 8 0 0 1 16 0" strokeLinejoin="round" />
                    <Path d="M12 11v-4" strokeLinecap="round" />
                    <Circle cx={12} cy={5} r={2} fill="none" />
                </Svg>
            );
        case 'culture':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M6 6h10" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M6 10h10" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            );
        case 'art':
            return (
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
                    <Path
                        d="M12 21a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9s9 4.03 9 9c0 1.3-.84 2.4-2.1 2.8-.5.16-1.1-.2-1.1-.76V13a2 2 0 0 0-2-2H9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <Circle cx={10} cy={8} r={1} fill={color} opacity={0.3} />
                    <Circle cx={14} cy={8} r={1} fill={color} opacity={0.3} />
                    <Circle cx={16} cy={12} r={1} fill={color} opacity={0.3} />
                </Svg>
            );
        default:
            return null;
    }
}
