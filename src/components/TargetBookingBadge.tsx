import React from 'react';
import { Business } from '../types';

interface TargetBookingBadgeProps {
  business: Business;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'reel' | 'card' | 'compact' | 'header';
}

export const TargetBookingBadge: React.FC<TargetBookingBadgeProps> = () => {
  return null;
};
