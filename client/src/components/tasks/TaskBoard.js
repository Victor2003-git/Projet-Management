'use client';

import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import useTaskStore from '../../store/taskStore';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';
import toast from 'react-hot-toast';
import './TaskBoard.css';

const TaskBoard = ({ projectId, members }) => {
  const { groupedTasks, updateTaskStatus, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: 'todo', title: 'À faire', color: 'var(--text-muted)' },
    { id: 'in_progress', title: 'En cours', color: 'var(--warning)' },
    { id: 'done', title: 'Terminé', color: 'var(--success)' },
  ];

  const handleDragStart = (event) => {
    const { active } = event;
    const task = findTask(active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the task
    const task = findTask(activeId);
    if (!task) return;

    // Determine destination column
    let destColumn = overId;
    if (!columns.find((c) => c.id === overId)) {
      // Dropped on a task, find its column
      const overTask = findTask(overId);
      if (overTask) {
        destColumn = overTask.status;
      }
    }

    // If status changed, update
    if (task.status !== destColumn) {
      // Optimistic update
      moveTask(activeId, task.status, destColumn, 0);

      // API call
      const result = await updateTaskStatus(activeId, destColumn);
      if (!result.success) {
        toast.error('Erreur lors de la mise à jour');
        // Revert would be handled by refetching tasks
      }
    }
  };

  const findTask = (taskId) => {
    for (const column of columns) {
      const task = groupedTasks[column.id]?.find((t) => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-board">
        {columns.map((column) => (
          <SortableContext
            key={column.id}
            items={groupedTasks[column.id]?.map((t) => t.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <TaskColumn
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={groupedTasks[column.id] || []}
              onTaskClick={handleTaskClick}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging />
        ) : null}
      </DragOverlay>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </DndContext>
  );
};

export default TaskBoard;
