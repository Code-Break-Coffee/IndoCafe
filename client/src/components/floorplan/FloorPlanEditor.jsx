import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Transformer } from 'react-konva';
import { Save, Trash2, Grid, ZoomIn, ZoomOut, Move, Square, Circle as CircleIcon, Layout, Monitor } from 'lucide-react';
import Button from '../ui/Button';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/useTheme';

// Constants
const GRID_SIZE = 20;
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;

// Theme-aware colors helper
const getColors = (isDark) => ({
  wall: isDark ? '#475569' : '#334155', // slate-600 : slate-700
  table: isDark ? '#64748b' : '#e2e8f0', // slate-500 : slate-200
  seat: isDark ? '#94a3b8' : '#94a3b8', // slate-400
  selected: '#3b82f6', // blue-500
  text: isDark ? '#f1f5f9' : '#1e293b', // slate-100 : slate-800
});

const ShapeComponent = ({ shapeProps, isSelected, onSelect, onChange, isDark }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const colors = getColors(isDark);

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Group
        draggable
        x={shapeProps.position?.x || 0}
        y={shapeProps.position?.y || 0}
        rotation={shapeProps.position?.rotation || 0}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            position: {
              ...shapeProps.position,
              x: Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE,
              y: Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE,
            },
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          // For simplicity in this version, we don't scale the width/height property permanently
          // to avoid DB schema complexity, but strictly we should.
          // For now, let's just update rotation and position.
          // If scaling is needed, we need to update model to store width/height or scale.

          onChange({
            ...shapeProps,
            position: {
              ...shapeProps.position,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
            },
          });

          // Reset scale to 1 to avoid compounding scale issues,
          // but strictly we should allow resizing:
          // node.scaleX(1);
          // node.scaleY(1);
        }}
        ref={shapeRef}
      >
        {shapeProps.shape === 'round-table' ? (
          <>
            <Circle
              radius={40} // Default radius if not dynamic
              fill={colors.table}
              stroke={isSelected ? colors.selected : '#cbd5e1'}
              strokeWidth={2}
              shadowBlur={5}
              shadowOpacity={0.1}
            />
            {/* Start simple seats (4 fixed for visual) */}
            <Circle x={0} y={-50} radius={8} fill={colors.seat} />
            <Circle x={0} y={50} radius={8} fill={colors.seat} />
            <Circle x={-50} y={0} radius={8} fill={colors.seat} />
            <Circle x={50} y={0} radius={8} fill={colors.seat} />

            <Text
              text={shapeProps.label}
              align="center"
              verticalAlign="middle"
              width={80}
              height={80}
              offsetX={40}
              offsetY={40}
              fontSize={12}
              fontStyle="bold"
              fill={colors.text}
            />
          </>
        ) : (
          <>
            <Rect
              width={shapeProps.shape === 'square-table' ? 60 : 100}
              height={60}
              fill={colors.table}
              stroke={isSelected ? colors.selected : '#cbd5e1'}
              strokeWidth={2}
              cornerRadius={5}
              shadowBlur={5}
              shadowOpacity={0.1}
              offsetX={shapeProps.shape === 'square-table' ? 30 : 50} // Center pivot
              offsetY={30}
            />
            <Text
              text={shapeProps.label}
              align="center"
              verticalAlign="middle"
              width={shapeProps.shape === 'square-table' ? 60 : 100}
              height={60}
              offsetX={shapeProps.shape === 'square-table' ? 30 : 50}
              offsetY={30}
              fontSize={12}
              fontStyle="bold"
              fill={colors.text}
            />
          </>
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

// ... imports

// ... ShapeComponent

const FloorPlanEditor = ({ tables = [], floor, onUpdate }) => {
  const [localTables, setLocalTables] = useState(tables);
  const [selectedId, selectShape] = useState(null);
  const stageRef = useRef();
  const dragItem = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Real Theme Context
  const { isDarkMode: isDark } = useTheme();

  // Pattern: Adjusting state when prop changes (better than useEffect)
  const [prevTables, setPrevTables] = useState(tables);
  if (tables !== prevTables) {
    setPrevTables(tables);
    setLocalTables(tables);
    setHasUnsavedChanges(false);
  }

  // Measure container on mount and resize

  // ... rest of code

  // Measure container on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const placedTables = useMemo(
    () => localTables.filter((t) => t.position && (t.position.x !== 0 || t.position.y !== 0)),
    [localTables]
  );
  const unplacedTables = useMemo(
    () => localTables.filter((t) => !t.position || (t.position.x === 0 && t.position.y === 0)),
    [localTables]
  );

  const handleDragStart = (e) => {
    dragItem.current = e.target.getAttribute('data-id');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);
    const stage = stageRef.current.getStage();
    const { x, y } = stage.getPointerPosition();

    const tableId = dragItem.current;
    const tableIndex = localTables.findIndex((t) => t._id === tableId);

    if (tableIndex !== -1) {
      const newTables = [...localTables];
      newTables[tableIndex] = {
        ...newTables[tableIndex],
        position: {
          x: Math.round(x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(y / GRID_SIZE) * GRID_SIZE,
          rotation: 0,
        },
      };
      setLocalTables(newTables);
      setHasUnsavedChanges(true); // Mark dirty
      selectShape(tableId);
    }
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const moveToUnplaced = () => {
    if (selectedId) {
      const newTables = localTables.map((t) => {
        if (t._id === selectedId) {
          return { ...t, position: { x: 0, y: 0, rotation: 0 } };
        }
        return t;
      });
      setLocalTables(newTables);
      setHasUnsavedChanges(true);
      selectShape(null);
    }
  };

  const handleSave = async () => {
    try {
      const updates = localTables.map((t) => api.put(`/api/manager/tables/${t._id}`, { position: t.position }));
      await Promise.all(updates);
      toast.success('Layout saved successfully');
      setHasUnsavedChanges(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Save failed', error);
      toast.error('Failed to save layout');
    }
  };

  const handleRevert = () => {
    if (window.confirm('Discard unsaved changes?')) {
      setLocalTables(tables);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Toolbar Header - More distinct colors */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Layout size={20} className="text-primary" />
            Floor {floor} Layout
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {hasUnsavedChanges ? (
              <span className="text-orange-500 font-medium">Unsaved Changes</span>
            ) : (
              'All changes saved'
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-sm h-9"
            onClick={handleRevert}
            disabled={!hasUnsavedChanges}
          >
            <Monitor size={16} /> Revert
          </Button>
          <Button className="flex items-center gap-2 text-sm h-9" onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save size={16} /> Save Layout
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fix color schema */}
        <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-inner z-10">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wider">
              Unplaced Items
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {unplacedTables.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No unplaced tables.</p>
                <p className="text-xs mt-2">Create more in List View.</p>
              </div>
            )}

            {unplacedTables.map((table) => (
              <div
                key={table._id}
                draggable
                onDragStart={handleDragStart}
                data-id={table._id}
                className="group flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:border-primary hover:shadow-md transition-all bg-white dark:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-500 group-hover:text-primary">
                    {table.shape === 'round-table' ? <CircleIcon size={24} /> : <Square size={24} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{table.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{table.capacity} Seats</p>
                  </div>
                </div>
                <Move size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {selectedId ? (
              <Button
                variant="danger"
                className="w-full flex justify-center items-center gap-2 text-sm"
                onClick={moveToUnplaced}
              >
                <Trash2 size={16} /> Remove from Canvas
              </Button>
            ) : (
              <p className="text-xs text-center text-gray-400">Select an item on canvas to remove</p>
            )}
          </div>
        </div>

        {/* Canvas Area - Dynamic Size */}
        <div
          ref={containerRef}
          className="flex-1 bg-gray-100 dark:bg-gray-900 relative overflow-hidden"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10"
            style={{
              backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
          />

          <Stage
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            ref={stageRef}
            draggable // Allow panning the whole stage? Maybe not if we want fixed grid. Let's keep fixed for now or allow if user demands.
          >
            <Layer>
              {/* Visual Border for the 'Printable' area if needed, but for now just infinite canvas feel */}

              {placedTables.map((table) => (
                <ShapeComponent
                  key={table._id}
                  shapeProps={table}
                  isSelected={table._id === selectedId}
                  onSelect={() => selectShape(table._id)}
                  onChange={(newAttrs) => {
                    const newTables = localTables.map((t) => (t._id === newAttrs._id ? newAttrs : t));
                    setLocalTables(newTables);
                    setHasUnsavedChanges(true);
                  }}
                  isDark={isDark}
                />
              ))}
            </Layer>
          </Stage>

          {/* Scale Badge / Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <div className="bg-white/90 dark:bg-gray-800/90 px-3 py-1 text-xs rounded-full shadow border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 backdrop-blur-sm">
              Canvas: {Math.round(dimensions.width)}x{Math.round(dimensions.height)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanEditor;
