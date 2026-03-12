'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const TaskColumn = ({ id, title, color, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`task-column ${isOver ? 'drag-over' : ''}`}
      ref={setNodeRef}
    >
      <div className="column-header">
        <div className="column-title">
          <span className="dot" style={{ background: color }}></span>
          <span>{title}</span>
        </div>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-content">
        {tasks.length === 0 ? (
          <div className="column-empty">Aucune tâche</div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
