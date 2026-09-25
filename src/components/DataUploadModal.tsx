import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  RotateCcw, 
  Table, 
  FileText 
} from 'lucide-react';
import { SalesRecord, ColumnMetadata } from '../types';
import { parseCsvToRecords, extractColumnMetadata } from '../utils/dataAnalytics';
import { DEFAULT_SALES_CSV_STRING } from '../data/defaultSalesData';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadNewData: (records: SalesRecord[], datasetName: string) => void;
  onResetToDefault: () => void;
  currentDatasetName: string;
  currentRecords: SalesRecord[];
}

export const DataUploadModal: React.FC<DataUploadModalProps> = ({
  isOpen,
  onClose,
  onLoadNewData,
  onResetToDefault,
  currentDatasetName,
  currentRecords
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'schema'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<SalesRecord[] | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const metadata = extractColumnMetadata(currentRecords);

  const handleFileUpload = (file: File) => {
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setErrorMsg('The selected file appears to be empty.');
        return;
      }
      const { records, errors } = parseCsvToRecords(content);
      if (errors.length > 0 && records.length === 0) {
        setErrorMsg(`Failed to parse CSV: ${errors[0]}`);
        return;
      }
      setPreviewData(records);
      setPreviewFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteParse = () => {
    setErrorMsg(null);
    if (!pastedText.trim()) {
      setErrorMsg('Please enter or paste CSV text first.');
      return;
    }
    const { records, errors } = parseCsvToRecords(pastedText);
    if (errors.length > 0 && records.length === 0) {
      setErrorMsg(`Failed to parse CSV: ${errors[0]}`);
      return;
    }
    setPreviewData(records);
    setPreviewFileName('Pasted_Sales_Data.csv');
  };

  const applyPreviewData = () => {
    if (previewData && previewData.length > 0) {
      onLoadNewData(previewData, previewFileName || 'Custom Sales Data.csv');
      setPreviewData(null);
      onClose();
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + DEFAULT_SALES_CSV_STRING;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sales data - Sheet1.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Management & CSV Import</h3>
              <p className="text-xs text-slate-400">Current dataset: <strong className="text-emerald-400">{currentDatasetName}</strong> ({currentRecords.length} records)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste CSV Text
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Schema & Columns
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/70 transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Drop your CSV file here, or browse
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Accepts standard comma-separated files like <code className="text-indigo-300">Sales data - Sheet1.csv</code> with automatic header mapping.
                </p>
              </div>

              {/* Quick Template & Restore Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onResetToDefault}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  Restore default Sales data - Sheet1.csv
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Download Sales data - Sheet1.csv
                </button>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Paste raw CSV text (including headers):
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  placeholder="Order ID,Order Date,Customer Name,Region,Category,Sales,Profit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={handlePasteParse}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                Parse & Preview CSV
              </button>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Detected schema for the active dataset ({metadata.length} columns detected):
              </p>
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {metadata.map(col => (
                  <div key={col.key} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{col.label}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-500">({col.key})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {col.type}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {col.uniqueValuesCount} unique
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {previewData && (
            <div className="mt-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Successfully parsed {previewData.length} records!
                </div>
                <span className="text-xs text-indigo-300">{previewFileName}</span>
              </div>
              <p className="text-xs text-slate-300">
                Ready to replace current dashboard metrics with your newly uploaded records.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyPreviewData}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                >
                  Load into Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>RFC-4180 Compliant CSV parser</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
