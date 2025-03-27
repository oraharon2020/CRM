import React from 'react';
import { HiCheck, HiX, HiPencil, HiTrash, HiRefresh } from 'react-icons/hi';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import Spinner from '../../../components/Spinner';
import { AnalyticsIntegration } from './types';
import { getIntegrationTypeDisplay, getIntegrationTypeIcon, formatDate } from './IntegrationUtils';

interface IntegrationCardProps {
  integration: AnalyticsIntegration;
  onEdit: (integration: AnalyticsIntegration) => void;
  onDelete: (id: number) => void;
  onSync: (id: number) => void;
  onToggleEnabled: (id: number, currentStatus: boolean) => void;
  syncing: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onEdit,
  onDelete,
  onSync,
  onToggleEnabled,
  syncing
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl ml-2">{getIntegrationTypeIcon(integration.type)}</span>
          <div>
            <h3 className="font-medium text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-500">{getIntegrationTypeDisplay(integration.type)}</p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => onToggleEnabled(integration.id, integration.is_enabled)}
            className={`p-1 rounded-full ml-1 ${
              integration.is_enabled 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={integration.is_enabled ? 'פעיל' : 'לא פעיל'}
          >
            {integration.is_enabled ? <HiCheck className="w-5 h-5" /> : <HiX className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">סנכרון אחרון:</p>
          <p className="text-sm font-medium">
            {integration.last_sync 
              ? formatDate(integration.last_sync.start_time)
              : 'לא סונכרן מעולם'}
          </p>
          {integration.last_sync && (
            <p className="text-xs text-gray-500 mt-1">
              {integration.last_sync.status === 'completed' 
                ? `הושלם בהצלחה (${integration.last_sync.records_processed} רשומות)`
                : integration.last_sync.status === 'pending'
                ? 'בתהליך...'
                : 'נכשל'}
            </p>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <div className="flex space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(integration)}
              className="flex items-center"
            >
              <HiPencil className="ml-1 w-4 h-4" />
              ערוך
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(integration.id)}
              className="flex items-center text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
            >
              <HiTrash className="ml-1 w-4 h-4" />
              מחק
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSync(integration.id)}
            disabled={syncing || !integration.is_enabled}
            className="flex items-center"
          >
            {syncing ? (
              <>
                <Spinner size="sm" className="ml-1" />
                מסנכרן...
              </>
            ) : (
              <>
                <HiRefresh className="ml-1 w-4 h-4" />
                סנכרן
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default IntegrationCard;
