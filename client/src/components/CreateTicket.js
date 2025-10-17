import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { aiService } from '../services/aiService';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Wand2 } from 'lucide-react';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 2,
    category: 1
  });
  const [loading, setLoading] = useState(false);
  const [classifyLoading, setClassifyLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await ticketService.createTicket(formData);
      toast.success('Ticket created successfully!');
      navigate('/tickets');
    } catch (error) {
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestFields = async () => {
    if (!formData.description.trim()) {
      toast.info('Please enter a description first.');
      return;
    }
    setClassifyLoading(true);
    try {
      const suggestion = await aiService.classifyAsync(formData.description);
      const categoryMap = { Hardware: 1, Software: 2, Network: 3, Other: 4 };
      setFormData({
        ...formData,
        priority: Number(suggestion.priority) || formData.priority,
        category: categoryMap[suggestion.category] || formData.category
      });
      toast.success(`Suggested: ${suggestion.category}, priority ${suggestion.priority}`);
    } catch (e) {
      toast.error('Failed to suggest fields');
    } finally {
      setClassifyLoading(false);
    }
  };

  const priorityOptions = [
    { value: 1, label: 'Low', description: 'Minor issues that can wait' },
    { value: 2, label: 'Medium', description: 'Standard priority issues' },
    { value: 3, label: 'High', description: 'Important issues that need attention' },
    { value: 4, label: 'Urgent', description: 'Critical issues requiring immediate attention' }
  ];

  const categoryOptions = [
    { value: 1, label: 'Hardware', description: 'Computer, printer, or other hardware issues' },
    { value: 2, label: 'Software', description: 'Application or software problems' },
    { value: 3, label: 'Network', description: 'Internet, WiFi, or network connectivity' },
    { value: 4, label: 'Other', description: 'General IT support or other issues' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 mb-4 dark:text-secondary-300"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Create New Ticket</h1>
        <p className="text-secondary-600 mt-1 dark:text-secondary-300">Describe your IT issue and we'll help you resolve it.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-2 dark:text-secondary-300">
                Ticket Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Brief description of the issue"
                maxLength={200}
              />
              <p className="text-xs text-secondary-500 mt-1 dark:text-secondary-400">
                {formData.title.length}/200 characters
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2 dark:text-secondary-300">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable..."
                maxLength={2000}
              />
              <p className="text-xs text-secondary-500 mt-1 dark:text-secondary-400">
                {formData.description.length}/2000 characters
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSuggestFields}
                  disabled={classifyLoading || !formData.description.trim()}
                  className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>{classifyLoading ? 'Suggesting...' : 'AI: Suggest category/priority'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-secondary-700 mb-2 dark:text-secondary-300">
                  Priority *
                </label>
                <select
                  id="priority"
                  name="priority"
                  required
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-field"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-2 dark:text-secondary-300">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{loading ? 'Creating...' : 'Create Ticket'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
