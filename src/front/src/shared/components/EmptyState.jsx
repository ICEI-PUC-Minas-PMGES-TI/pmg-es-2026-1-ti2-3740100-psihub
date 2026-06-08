import { createElement } from 'react';

export function EmptyState({ icon: Icon, title }) {
    return (
        <div className="empty-state">
            {createElement(Icon, { size: 22 })}
            <span>{title}</span>
        </div>
    );
}
