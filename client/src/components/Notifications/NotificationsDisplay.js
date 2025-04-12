import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NotificationService from '../../services/notification.service';
import AuthService from '../../services/auth.service';

const NotificationsDisplay = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null); // Ref for detecting clicks outside

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            fetchNotifications();
            // Optional: Set up polling or WebSocket connection later for real-time updates
            const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
            return () => clearInterval(interval); // Cleanup interval on unmount
        }
    }, []);

     // Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);


    const fetchNotifications = () => {
        setLoading(true);
        NotificationService.getUnreadNotifications().then(
            (response) => {
                setNotifications(response.data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching notifications:", error);
                setLoading(false);
            }
        );
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Optionally re-fetch when opening
            fetchNotifications();
        }
    };

    const handleMarkAsRead = (e, notificationId) => {
        e.preventDefault(); // Prevent link navigation if needed immediately
        NotificationService.markAsRead([notificationId]).then(() => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            // Allow navigation after marking as read
            // Find the notification link and navigate? Or let user click again?
        }).catch(err => console.error("Error marking notification as read:", err));
    };

     const handleMarkAllAsRead = () => {
        NotificationService.markAllAsRead().then(() => {
            setNotifications([]); // Clear notifications locally
            setIsOpen(false); // Close dropdown
        }).catch(err => console.error("Error marking all notifications as read:", err));
    };


    const unreadCount = notifications.length;

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
            <button onClick={handleToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '5px' }}>
                🔔 {/* Bell Icon */}
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 5px',
                        fontSize: '0.7em',
                        lineHeight: '1'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '5px',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    width: '300px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1000
                }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Notifications</strong>
                         {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.8em', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
                                Mark all as read
                            </button>
                         )}
                    </div>
                    {loading && <div style={{ padding: '10px', textAlign: 'center' }}>Loading...</div>}
                    {!loading && notifications.length === 0 && (
                        <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>No unread notifications.</div>
                    )}
                    {!loading && notifications.map(n => (
                        <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link
                                to={n.link || '#'}
                                onClick={() => setIsOpen(false)} // Close dropdown on click
                                style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, marginRight: '10px' }}
                            >
                                {n.message}
                                <div style={{ fontSize: '0.8em', color: '#888', marginTop: '3px' }}>
                                    {new Date(n.createdAt).toLocaleString()}
                                </div>
                            </Link>
                             <button
                                onClick={(e) => handleMarkAsRead(e, n.id)}
                                title="Mark as read"
                                style={{ background: 'none', border: '1px solid #ccc', borderRadius: '50%', cursor: 'pointer', padding: '2px 5px', fontSize: '0.8em', lineHeight: '1' }}
                            >
                                ✓
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsDisplay;
