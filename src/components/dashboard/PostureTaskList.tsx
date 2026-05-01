// ============================================================================
// Posture Task List — Interactive Checklist
// ============================================================================

import { useState } from 'react';
import type { PostureTask } from '../../models';

interface PostureTaskListProps {
  tasks: PostureTask[];
  onComplete: (taskId: string) => void;
  completedIds: string[];
}

export function PostureTaskList({ tasks, onComplete, completedIds }: PostureTaskListProps) {
  return (
    <div className="posture-list">
      {tasks.map((task) => {
        const isDone = completedIds.includes(task.id);
        return (
          <PostureTaskItem
            key={task.id}
            task={task}
            isDone={isDone}
            onComplete={() => onComplete(task.id)}
          />
        );
      })}
    </div>
  );
}

function PostureTaskItem({ task, isDone, onComplete }: { task: PostureTask; isDone: boolean; onComplete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`posture-item ${isDone ? 'posture-item--done' : ''}`}>
      <div className="posture-item__main" onClick={() => !isDone && setExpanded(!expanded)}>
        <button
          className={`posture-item__check ${isDone ? 'posture-item__check--done' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDone) onComplete();
          }}
          disabled={isDone}
        >
          {isDone ? '✓' : ''}
        </button>
        <div className="posture-item__info">
          <div className="posture-item__name">{task.name}</div>
          <div className="posture-item__target">
            Hold {task.targetSeconds}s × {task.targetSets} sets
          </div>
        </div>
        <div className="posture-item__area">{task.targetArea}</div>
      </div>
      {expanded && !isDone && (
        <div className="posture-item__detail">
          <p className="posture-item__desc">{task.instructions}</p>
          <button className="posture-item__complete-btn" onClick={onComplete}>
            Mark Complete ✓
          </button>
        </div>
      )}
    </div>
  );
}
