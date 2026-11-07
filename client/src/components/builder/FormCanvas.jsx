import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  GitBranch,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  TextInput,
  LongTextInput,
  EmailInput,
  NumberInput,
  DropdownInput,
  RadioInput,
  CheckboxInput,
  DateInput,
  RatingInput,
  SwitchInput
} from '../renderer/FieldComponents';

function SortableFieldCard({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  primaryColor
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1
  };

  const renderFieldPreview = () => {
    const commonProps = {
      ...field,
      disabled: true,
      value: undefined,
      onChange: () => {}
    };

    switch (field.type) {
      case 'text':
        return <TextInput {...commonProps} />;
      case 'longtext':
        return <LongTextInput {...commonProps} />;
      case 'email':
        return <EmailInput {...commonProps} />;
      case 'number':
        return <NumberInput {...commonProps} />;
      case 'dropdown':
        return <DropdownInput {...commonProps} />;
      case 'radio':
        return <RadioInput {...commonProps} />;
      case 'checkbox':
        return <CheckboxInput {...commonProps} />;
      case 'date':
        return <DateInput {...commonProps} />;
      case 'rating':
        return <RatingInput {...commonProps} />;
      case 'switch':
        return <SwitchInput {...commonProps} />;
      default:
        return <div>{field.label}</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(field.id);
      }}
      className={`group relative bg-white rounded-xl border transition-all cursor-pointer p-5 ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top Action Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1 -ml-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100 transition-colors"
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Type Badge */}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {field.type}
          </span>

          {field.required && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">
              Required
            </span>
          )}

          {field.condition && field.condition.fieldId && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              Conditional
            </span>
          )}
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            disabled={isFirst}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(field.id);
            }}
            title="Move Up"
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(field.id);
            }}
            title="Move Down"
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(field);
            }}
            title="Duplicate Field"
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            title="Delete Field"
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Field Preview Content */}
      <div className="pointer-events-none select-none">{renderFieldPreview()}</div>
    </div>
  );
}

export default function FormCanvas({
  title,
  description,
  onUpdateTitle,
  onUpdateDescription,
  fields = [],
  selectedFieldId,
  onSelectField,
  onReorderFields,
  onAddFieldFromDrop,
  onDeleteField,
  onDuplicateField,
  theme = {}
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      onReorderFields(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const handleMoveUp = (fieldId) => {
    const idx = fields.findIndex((f) => f.id === fieldId);
    if (idx > 0) {
      onReorderFields(arrayMove(fields, idx, idx - 1));
    }
  };

  const handleMoveDown = (fieldId) => {
    const idx = fields.findIndex((f) => f.id === fieldId);
    if (idx < fields.length - 1) {
      onReorderFields(arrayMove(fields, idx, idx + 1));
    }
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (raw) {
        const item = JSON.parse(raw);
        onAddFieldFromDrop(item);
      }
    } catch (err) {
      // Ignored
    }
  };

  const primaryColor = theme.primaryColor || '#4f46e5';

  return (
    <main
      className="flex-1 bg-slate-100 overflow-y-auto p-8"
      onClick={() => onSelectField(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Form Header Card */}
        <div
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="h-3 w-full"
            style={{ backgroundColor: primaryColor }}
          />
          <div className="p-6 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="Form Title"
              className="w-full text-2xl font-bold text-slate-800 placeholder-slate-300 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none transition-colors pb-1"
            />
            <textarea
              rows={2}
              value={description}
              onChange={(e) => onUpdateDescription(e.target.value)}
              placeholder="Form description or instructions for respondents..."
              className="w-full text-sm text-slate-600 placeholder-slate-300 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none resize-none transition-colors"
            />
          </div>
        </div>

        {/* Drag and drop fields list */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {fields.map((field, idx) => (
                <SortableFieldCard
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onSelect={onSelectField}
                  onDelete={onDeleteField}
                  onDuplicate={onDuplicateField}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={idx === 0}
                  isLast={idx === fields.length - 1}
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Empty Canvas Placeholder */}
        {fields.length === 0 && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-white/50 hover:bg-white transition-all flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Canvas is empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Drag fields from the left palette or click any field type to start assembling your form.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
