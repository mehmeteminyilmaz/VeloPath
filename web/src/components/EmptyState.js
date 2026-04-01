import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLink, 
  actionLabel, 
  actionIcon: ActionIcon 
}) => {
  return (
    <div className="empty-state-container animate-slide-up">
      <div className="empty-state-icon-wrapper">
        <Icon size={48} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLink && (
        <Link to={actionLink} className="button empty-state-button">
          {ActionIcon && <ActionIcon size={20} />}
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
