
import React from 'react';
import { PREDEFINED_ROOMS } from '../../constants';

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

interface LocationStickerProps {
    locations: string[];
    className?: string;
    hideNonPredefined?: boolean;
}

const LocationSticker: React.FC<LocationStickerProps> = ({ locations, className = '', hideNonPredefined = false }) => {
    if (!locations || locations.length === 0) return null;

    const predefinedNames = PREDEFINED_ROOMS.map(r => r.name);
    
    const filteredLocations = hideNonPredefined 
        ? locations.filter(loc => predefinedNames.includes(loc))
        : locations;

    if (filteredLocations.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {filteredLocations.map((loc, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50 shadow-sm">
                    <LocationIcon />
                    {loc}
                </span>
            ))}
        </div>
    );
};

export default LocationSticker;
