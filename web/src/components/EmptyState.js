import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  illustration,
  icon: Icon,
  title,
  description,
  actionLink,
  actionLabel,
  actionIcon: ActionIcon
}) => {
  return (
    <div className="empty-state-container animate-fade-in">
      {illustration ? (
        <div className="empty-state-illustration-wrapper">
          <img src={illustration} alt={title} className="empty-state-illustration" />
        </div>
      ) : (
        Icon && (
          <div className="empty-state-icon-wrapper">
            <Icon size={40} />
          </div>
        )
      )}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLink && actionLabel && (
        <Link to={actionLink} className="button empty-state-button">
          {ActionIcon && <ActionIcon size={18} style={{ marginRight: '8px' }} />}
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
