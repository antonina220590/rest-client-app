'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addVariable, deleteVariable } from '../../../store/variablesSlice';

export default function VariablesList() {
  const variables = useAppSelector((state) => state.variables);
  const dispatch = useAppDispatch();
  const [newVar, setNewVar] = useState({ key: '', value: '' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleAdd = () => {
    if (newVar.key && newVar.value) {
      dispatch(addVariable(newVar));
      setNewVar({ key: '', value: '' });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl font-bold mb-6 text-bg-secondary">
        Variables Management
      </h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-bg-secondary">
              Key
            </label>
            <input
              value={newVar.key}
              onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
              placeholder="API_URL"
              className="w-full p-2 border rounded font-body focus:outline-none focus:ring-2 focus:ring-cta-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-bg-secondary">
              Value
            </label>
            <input
              value={newVar.value}
              onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
              placeholder="https://api.example.com"
              className="w-full p-2 border rounded font-body focus:outline-none focus:ring-2 focus:ring-cta-primary"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary"
          disabled={!newVar.key || !newVar.value}
        >
          Add Variable
        </button>
      </div>

      <div className="space-y-3">
        {variables.map((variable) => (
          <div
            key={variable.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div className="flex items-center">
              <span className="font-code bg-gray-100 px-2 py-1 rounded mr-3 text-bg-secondary">
                {`{{${variable.key}}}`}
              </span>
              <span className="font-body text-bg-secondary">
                {variable.value}
              </span>
            </div>
            <button
              onClick={() => dispatch(deleteVariable(variable.id))}
              className="text-red-700 hover:text-red-800 transition-all cursor-pointer duration-200 transform hover:scale-110"
              aria-label="Delete variable"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
