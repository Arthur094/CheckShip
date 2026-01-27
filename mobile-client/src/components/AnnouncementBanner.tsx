import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Announcement {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    target: 'all' | 'web' | 'mobile';
}

interface AnnouncementBannerProps {
    platform: 'web' | 'mobile';
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ platform }) => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        fetchAnnouncement();

        // Subscribe to changes
        const subscription = supabase
            .channel('public:system_announcements')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_announcements' }, () => {
                fetchAnnouncement();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const { data, error } = await supabase
                .from('system_announcements')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const latest = data[0];
                // Check targeting
                if (latest.target === 'all' || latest.target === platform) {
                    setAnnouncement(latest);

                    // Check local storage for dismissal
                    const dismissedId = localStorage.getItem('dismissed_announcement');
                    if (dismissedId !== latest.id) {
                        setIsVisible(true);
                    }
                } else {
                    setIsVisible(false);
                }
            } else {
                setIsVisible(false);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleDismiss = () => {
        if (announcement) {
            setIsVisible(false);
            localStorage.setItem('dismissed_announcement', announcement.id);
        }
    };

    if (!isVisible || !announcement) return null;

    const getStyles = () => {
        switch (announcement.type) {
            case 'error':
                return 'bg-red-600 text-white';
            case 'warning':
                return 'bg-amber-500 text-white';
            case 'info':
            default:
                return 'bg-blue-600 text-white';
        }
    };

    const getIcon = () => {
        switch (announcement.type) {
            case 'error':
                return <AlertCircle size={20} />;
            case 'warning':
                return <AlertTriangle size={20} />;
            case 'info':
            default:
                return <Info size={20} />;
        }
    };

    return (
        <div className={`${getStyles()} px-4 py-3 shadow-md relative z-[100] animate-in slide-in-from-top duration-300`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                    <span className="shrink-0 mt-0.5">{getIcon()}</span>
                    <p className="text-sm font-medium leading-snug">{announcement.message}</p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0 -mt-1 -mr-1"
                    aria-label="Fechar aviso"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBanner;
