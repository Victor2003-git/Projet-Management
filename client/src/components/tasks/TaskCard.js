'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiCalendar } from 'react-icons/fi';
import Badge from '../ui/Badge';
import { format, isPast, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const TaskCard = ({ task, onClick, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: { variant: 'default', label: 'Basse' },
      medium: { variant: 'info', label: 'Moyenne' },
      high: { variant: 'danger', label: 'Haute' }
    };
    const { variant, label } = variants[priority] || variants.medium;
    return <Badge variant={variant} size="small">{label}</Badge>;
  };

  const getDueDateClass = () => {
    if (!task.due_date) return '';
    const dueDate = new Date(task.due_date);
    const now = new Date();
    
    if (isPast(dueDate) && task.status !== 'done') {
      return 'overdue';
    }
    
    const daysUntilDue = differenceInDays(dueDate, now);
    if (daysUntilDue <= 3 && task.status !== 'done') {
      return 'soon';
    }
    
    return '';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
    >
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        {getPriorityBadge(task.priority)}
      </div>
      
      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}
      
      <div className="task-card-footer">
        {task.assigned_first_name ? (
          <div className="task-assignee">
            <div className="task-assignee-avatar">
              {task.assigned_first_name?.charAt(0)}
              {task.assigned_last_name?.charAt(0)}
            </div>
            <span>{task.assigned_first_name}</span>
          </div>
        ) : (
          <span>Non assigné</span>
        )}
        
        {task.due_date && (
          <div className={`task-due-date ${getDueDateClass()}`}>
            <FiCalendar />
            <span>
              {format(new Date(task.due_date), 'd MMM', { locale: fr })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
