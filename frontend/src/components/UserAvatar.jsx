import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function resolveImageUrl(user, fallbackName) {
  const directImage =
    user?.profileImageUrl ||
    user?.imageUrl ||
    user?.avatarUrl ||
    user?.photoUrl ||
    user?.profileImage ||
    user?.profilePicture ||
    user?.avatar;

  // Return the direct image if available, otherwise null (use local initials)
  // Privacy: We don't send user data to third-party avatar services
  return directImage || null;
}

export default function UserAvatar({ user, fallbackName = 'User', className = '' }) {
  const initials = getInitials(user?.fullName || user?.name || fallbackName);
  const imageUrl = useMemo(() => resolveImageUrl(user, fallbackName), [user, fallbackName]);
  const [imageError, setImageError] = useState(false);

  // If no image URL or image failed to load, show initials
  if (!imageUrl || imageError) {
    return (
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold text-white ring-2 ring-primary-100 dark:ring-primary-900/40 ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${fallbackName} avatar`}
      className={`h-8 w-8 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900/40 ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

UserAvatar.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string,
    name: PropTypes.string,
    imageUrl: PropTypes.string,
    profileImageUrl: PropTypes.string,
    avatarUrl: PropTypes.string,
    photoUrl: PropTypes.string,
    profileImage: PropTypes.string,
    profilePicture: PropTypes.string,
    avatar: PropTypes.string
  }),
  fallbackName: PropTypes.string,
  className: PropTypes.string
};
