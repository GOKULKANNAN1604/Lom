// src/pages/pillars/Study.jsx
import { useState, useEffect, useRef } from 'react';
import {
  useStudyDocuments,
  useCreateStudyDocument,
  useUpdateStudyDocument,
  useDeleteStudyDocument
} from '../../hooks/usePillarData';

// Vector PDF Logo component
const PDFIcon = () => (
  <svg 
    className="w-9 h-11 flex-shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] transition-transform duration-200 group-hover:scale-105" 
    viewBox="0 0 40 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M4 0C1.79086 0 0 1.79086 0 4V44C0 46.2091 1.79086 48 4 48H36C38.2091 48 40 46.2091 40 44V12L28 0H4Z" 
      fill="#ef4444" 
    />
    <path 
      d="M28 0V12H40L28 0Z" 
      fill="#fca5a5" 
    />
    <rect 
      x="5" 
      y="24" 
      width="30" 
      height="14" 
      rx="2" 
      fill="white" 
    />
    <text 
      x="20" 
      y="34" 
      fill="#ef4444" 
      fontSize="9" 
      fontWeight="900" 
      fontFamily="sans-serif" 
      textAnchor="middle"
    >
      PDF
    </text>
  </svg>
);

// Helper function to read PDF structure and scan page count
function detectPDFPageCount(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const arr = new Uint8Array(e.target.result);
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(arr.slice(0, 1024 * 1024 * 10)); // read first 10MB as text
        
        // Scan for "/Type /Page" references in plain text PDF syntax
        const pageRegex = /\/Type\s*\/Page\b/g;
        let count = 0;
        let match;
        while ((match = pageRegex.exec(text)) !== null) {
          count++;
        }
        
        if (count > 0) {
          resolve(count);
          return;
        }
        
        // Fallback: search for "/Count [number]" page tree metadata
        const countRegex = /\/Count\s+(\d+)/g;
        let maxCount = 0;
        while ((match = countRegex.exec(text)) !== null) {
          const val = parseInt(match[1], 10);
          if (val > maxCount) {
            maxCount = val;
          }
        }
        resolve(maxCount || 1);
      } catch (err) {
        console.error("Failed to parse PDF binary pages count:", err);
        resolve(1);
      }
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file);
  });
}

// Convert underscores/dashes to spaces and capitalize for document title automatically
function cleanFilenameToTitle(filename) {
  if (!filename) return '';
  let name = filename.replace(/\.[^/.]+$/, ""); // strip extension
  name = name.replace(/[_-]/g, " "); // replace underscores/dashes with spaces
  return name.replace(/\b\w/g, c => c.toUpperCase()); // capitalize words
}

export default function StudyPage() {
  const { data: docsData, isLoading: docsLoading } = useStudyDocuments();
  const createDoc = useCreateStudyDocument();
  const updateDoc = useUpdateStudyDocument();
  const deleteDoc = useDeleteStudyDocument();

  const docs = docsData?.results ?? docsData ?? [];

  // Active Document & Page Progress States
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [pageInput, setPageInput] = useState(1);
  const [iframePage, setIframePage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Active Folder Directory state (null = Root)
  const [currentFolder, setCurrentFolder] = useState(null);

  // Search filter query
  const [searchTerm, setSearchTerm] = useState('');

  // Uploader and Folder Creation form toggles
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderInput, setNewFolderInput] = useState('');
  const [sessionFolders, setSessionFolders] = useState([]);

  // Scanning page count loading indicator
  const [pdfPageCountLoading, setPdfPageCountLoading] = useState(false);

  // Mobile active tab: 'explorer' or 'reader'
  const [activeMobileTab, setActiveMobileTab] = useState('explorer');

  // Form states
  const [docForm, setDocForm] = useState({
    title: '',
    category: '',
    customCategory: '',
    total_pages: 0,
    file: null,
  });

  const [docErrors, setDocErrors] = useState({});
  const timerRef = useRef(null);

  // Sync page input when a document is selected
  useEffect(() => {
    if (selectedDoc) {
      setPageInput(selectedDoc.current_page || 1);
      setIframePage(selectedDoc.current_page || 1);
    }
  }, [selectedDoc]);

  // Extract unique category names from docs list
  const existingCategories = Array.from(new Set(docs.map(d => d.category || 'General')));

  // Group documents by category folder
  const groupedDocs = docs.reduce((acc, doc) => {
    const cat = doc.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  // Sync custom session folders that are empty
  sessionFolders.forEach(folder => {
    if (!groupedDocs[folder]) {
      groupedDocs[folder] = [];
    }
  });

  // Combine unique categories from files + custom session folders
  const allFolders = Array.from(new Set([
    ...docs.map(d => d.category || 'General'),
    ...sessionFolders
  ])).sort((a, b) => a.localeCompare(b));

  // Select first document on load if available, but default explorer view to Root
  useEffect(() => {
    if (docs.length > 0 && !selectedDoc) {
      setSelectedDoc(docs[0]);
      setCurrentFolder(null); // Default explorer to Root directory
    }
  }, [docs, selectedDoc]);

  // Pre-select current directory folder inside uploader form
  useEffect(() => {
    if (currentFolder) {
      setDocForm(prev => ({ ...prev, category: currentFolder }));
    } else {
      setDocForm(prev => ({ ...prev, category: 'General' }));
    }
  }, [currentFolder]);

  // Folder navigation handler
  const navigateToFolder = (folderName) => {
    setCurrentFolder(folderName);
    setSearchTerm('');
  };

  // Select document and auto transition view for mobile
  const handleSelectDocument = (doc) => {
    setSelectedDoc(doc);
    setActiveMobileTab('reader'); // Auto switch tab to reading view
  };

  // Handler for custom inline new folder creation
  const handleCreateFolderSubmit = (e) => {
    e.preventDefault();
    const folderName = newFolderInput.trim();
    if (!folderName) return;
    if (!sessionFolders.includes(folderName)) {
      setSessionFolders(prev => [...prev, folderName]);
    }
    setNewFolderInput('');
    setShowFolderInput(false);
    navigateToFolder(folderName);
  };

  // Automatic PDF scan page handler on file selection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setDocForm(prev => ({
      ...prev,
      file: selectedFile,
      title: cleanFilenameToTitle(selectedFile.name)
    }));
    setDocErrors(prev => ({ ...prev, file: undefined, title: undefined }));

    setPdfPageCountLoading(true);
    try {
      const count = await detectPDFPageCount(selectedFile);
      setDocForm(prev => ({ ...prev, total_pages: count }));
    } catch (err) {
      console.error("Error detecting PDF page count:", err);
      setDocForm(prev => ({ ...prev, total_pages: 1 }));
    } finally {
      setPdfPageCountLoading(false);
    }
  };

  // Submit Study Document / PDF
  const handleDocSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!docForm.title.trim()) errs.title = 'Title is required.';
    if (!docForm.file) errs.file = 'PDF document is required.';
    
    let folderName = 'General';
    if (docForm.category === 'new') {
      if (!docForm.customCategory.trim()) {
        errs.customCategory = 'Folder name is required.';
      } else {
        folderName = docForm.customCategory.trim();
      }
    } else if (docForm.category) {
      folderName = docForm.category;
    } else if (currentFolder) {
      folderName = currentFolder;
    }

    if (Object.keys(errs).length > 0) {
      setDocErrors(errs);
      return;
    }

    const formData = new FormData();
    formData.append('title', docForm.title);
    formData.append('category', folderName);
    formData.append('total_pages', Number(docForm.total_pages) || 1);
    formData.append('pdf_file', docForm.file);
    formData.append('status', 'PLAN');

    try {
      const response = await createDoc.mutateAsync(formData);
      setSelectedDoc(response.data);
      setDocForm({ title: '', category: '', customCategory: '', total_pages: 0, file: null });
      setDocErrors({});
      setShowUploadForm(false);
      
      // Auto enter uploaded folder
      navigateToFolder(folderName);
    } catch (err) {
      setDocErrors(err.response?.data || {});
    }
  };

  // Save progress dynamically with debounce
  const triggerAutoSave = (val) => {
    const finalPage = Math.min(selectedDoc.total_pages, Math.max(0, val));
    const newStatus = finalPage >= selectedDoc.total_pages ? 'COMPLETED' : 'READING';
    
    // 1. Optimistic UI update
    setSelectedDoc(prev => ({ ...prev, current_page: finalPage, status: newStatus }));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      // 2. Commit iframe and patch DB
      setIframePage(finalPage);
      try {
        await updateDoc.mutateAsync({
          id: selectedDoc.id,
          data: { current_page: finalPage, status: newStatus }
        });
      } catch (err) {
        console.error('Error auto-saving page progress:', err);
      }
    }, 600);
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setPageInput(val);
    triggerAutoSave(val);
  };

  // Filtering files based on active folder directory & search query
  const filteredFiles = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (searchTerm) {
      if (currentFolder === null) {
        // Root Search: scan all folders
        return matchesSearch;
      } else {
        // Folder Search: filter inside folder
        return (doc.category || 'General') === currentFolder && matchesSearch;
      }
    } else {
      // Normal Folder navigation: show folder files
      return currentFolder !== null && (doc.category || 'General') === currentFolder;
    }
  });

  // Sort files array alphabetically by default
  const sortedFiles = [...filteredFiles].sort((a, b) => a.title.localeCompare(b.title));

  // Determine responsive classes
  const explorerDisplayClass = isFullscreen
    ? "hidden"
    : (activeMobileTab === 'explorer' ? "block" : "hidden lg:block");

  const readerDisplayClass = isFullscreen
    ? "block"
    : (activeMobileTab === 'reader' ? "block" : "hidden lg:block");

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary flex items-center gap-3 animate-slide-in">
          <span>📚</span> Study Vault
        </h1>
        <p className="text-secondary text-sm mt-1 animate-slide-in">
          Manage your PDF documents inside custom folders and track your daily reading page progress.
        </p>
      </div>

      {/* Responsive Tab Switcher (Mobile Only) */}
      <div className="flex lg:hidden bg-white/5 p-1 rounded-xl border border-white/[0.06] mb-2">
        <button
          onClick={() => setActiveMobileTab('explorer')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer
            ${activeMobileTab === 'explorer' ? 'bg-study text-white shadow-glow-study' : 'text-secondary hover:text-primary'}`}
        >
          <span>📂</span> Explorer
        </button>
        <button
          onClick={() => setActiveMobileTab('reader')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer relative
            ${activeMobileTab === 'reader' ? 'bg-study text-white shadow-glow-study' : 'text-secondary hover:text-primary'}`}
        >
          <span>📖</span> PDF Reader
          {selectedDoc && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse absolute top-2 right-4" />
          )}
        </button>
      </div>

      {/* Main Grid Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SIMPLIFIED Explorer card (SPAN 5) */}
        <div className={`lg:col-span-5 ${explorerDisplayClass} space-y-4 animate-slide-in`}>
          
          <div className="glass-card p-4 sm:p-5 flex flex-col h-[520px] border border-white/[0.08] shadow-lg relative rounded-2xl">
            
            {/* Simplified Header / Toolbar Row */}
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3 mb-3 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {/* Back Arrow to Root */}
                {(currentFolder !== null || searchTerm) && (
                  <button
                    onClick={() => navigateToFolder(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-xs text-primary transition-all cursor-pointer font-bold border border-white/[0.04] flex-shrink-0"
                    title="Back to folders"
                  >
                    ◀
                  </button>
                )}
                <span className="text-sm font-bold text-primary truncate">
                  {searchTerm ? (
                    <span>🔍 Results</span>
                  ) : currentFolder === null ? (
                    <span>🗂️ Folders</span>
                  ) : (
                    <span>📂 {currentFolder}</span>
                  )}
                </span>
              </div>

              {/* Action Buttons & Search */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowFolderInput(!showFolderInput);
                    setShowUploadForm(false);
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-primary border border-white/[0.04] rounded-lg text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
                  title="New Folder"
                >
                  📁+
                </button>
                <button
                  onClick={() => {
                    setShowUploadForm(!showUploadForm);
                    setShowFolderInput(false);
                  }}
                  className="p-1.5 bg-study/20 hover:bg-study/35 text-study-light border border-study/30 rounded-lg text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Upload PDF"
                >
                  📤
                </button>

                {/* Compact Search Bar */}
                <div className="relative w-24 sm:w-32">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-[10px] text-muted">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-study/60 rounded-lg pl-6 pr-5 py-1 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-study/60"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-1.5 flex items-center text-[9px] text-muted hover:text-primary cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Explorer Workspace Body */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* Folder Creation Form */}
              {showFolderInput && (
                <form onSubmit={handleCreateFolderSubmit} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5 mb-3.5 animate-fade-in flex gap-1.5 items-center">
                  <input
                    type="text"
                    placeholder="New folder name..."
                    className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-study"
                    value={newFolderInput}
                    onChange={(e) => setNewFolderInput(e.target.value)}
                    required
                    autoFocus
                  />
                  <button type="submit" className="px-2.5 py-1 text-xs bg-study hover:bg-study-dark text-white font-semibold rounded-lg">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowFolderInput(false)} className="px-2 py-1 bg-white/5 text-secondary hover:text-primary rounded-lg text-xs">
                    ✕
                  </button>
                </form>
              )}

              {/* PDF Uploader Form */}
              {showUploadForm && (
                <div className="border border-white/[0.08] bg-white/[0.02] p-3 rounded-xl mb-3.5 animate-fade-in relative space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="absolute top-2 right-2 text-muted hover:text-primary text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                  <h4 className="text-[10px] font-extrabold text-study uppercase tracking-wider">
                    Upload to: {currentFolder || 'General'}
                  </h4>
                  <form onSubmit={handleDocSubmit} className="space-y-2">
                    
                    {/* File selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-secondary font-bold block uppercase tracking-widest">PDF File</label>
                      <label className="flex items-center justify-center border border-dashed border-white/20 hover:border-study/60 rounded-lg px-3 py-1.5 cursor-pointer text-xs text-secondary hover:text-primary transition-colors h-[34px] bg-white/[0.01]">
                        <span>Select PDF</span>
                        <input
                          id="pdf-file-input"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      {pdfPageCountLoading && (
                        <p className="text-[9px] text-yellow-400 animate-pulse font-medium text-center">Scanning pages...</p>
                      )}
                      {docForm.file && !pdfPageCountLoading && (
                        <p className="text-[9px] text-study truncate text-center font-bold mt-1 bg-study/10 py-0.5 rounded border border-study/20">
                          Selected: {docForm.file.name.slice(0, 20)}... ({docForm.total_pages || 0} pages)
                        </p>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-secondary font-bold block uppercase tracking-widest">Title</label>
                      <input
                        type="text"
                        placeholder="File title"
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-study"
                        value={docForm.title}
                        onChange={(e) => setDocForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Folder Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-secondary font-bold block uppercase tracking-widest">Folder Destination</label>
                      <select
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-study cursor-pointer"
                        value={docForm.category}
                        onChange={(e) => setDocForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="General">General</option>
                        {existingCategories.filter(c => c !== 'General').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="new">+ Create New Folder</option>
                      </select>
                    </div>

                    {docForm.category === 'new' && (
                      <div className="space-y-1">
                        <label className="text-[9px] text-secondary font-bold block uppercase tracking-widest">New Folder Name</label>
                        <input
                          type="text"
                          placeholder="Folder name"
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1 text-xs text-primary focus:outline-none"
                          value={docForm.customCategory}
                          onChange={(e) => setDocForm(prev => ({ ...prev, customCategory: e.target.value }))}
                          required
                        />
                      </div>
                    )}

                    <div className="flex gap-1.5 pt-1.5">
                      <button
                        type="submit"
                        disabled={createDoc.isPending || pdfPageCountLoading}
                        className="flex-1 py-1.5 bg-study hover:bg-study-dark text-white font-bold rounded-lg text-xs cursor-pointer shadow-glow-study"
                      >
                        {createDoc.isPending ? 'Adding...' : 'Add PDF'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-secondary hover:text-primary rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Directories/Files display area */}
              {docsLoading ? (
                <div className="space-y-2 animate-pulse py-4">
                  <div className="h-10 bg-white/[0.02] rounded-xl" />
                  <div className="h-10 bg-white/[0.02] rounded-xl" />
                </div>
              ) : searchTerm ? (
                /* SEARCH RESULTS */
                <div>
                  {filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-xs text-muted">
                      No files match "{searchTerm}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {sortedFiles.map(doc => renderFileGridCard(doc))}
                    </div>
                  )}
                </div>
              ) : currentFolder === null ? (
                /* ROOT DIRECTORY VIEW: GRID OF FOLDERS */
                <div>
                  {allFolders.length === 0 ? (
                    <div className="text-center p-8 text-xs text-muted border border-dashed border-border rounded-xl">
                      No folders created yet. Click "Upload PDF" or the 📁+ button to start!
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {allFolders.map(folderName => {
                        const filesList = groupedDocs[folderName] || [];
                        return (
                          <div
                            key={folderName}
                            onClick={() => navigateToFolder(folderName)}
                            className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-study/10 hover:border-study/30 cursor-pointer flex flex-col items-center justify-center text-center h-[110px] transition-all duration-200 group relative"
                          >
                            <div className="text-3xl text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.2)] group-hover:scale-105 transition-transform duration-200">
                              📁
                            </div>
                            <span className="text-xs font-bold text-primary mt-2 truncate w-full px-1">
                              {folderName}
                            </span>
                            <span className="text-[9px] text-muted font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/[0.02] mt-1">
                              {filesList.length} files
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* SUB-DIRECTORY VIEW: FILES LIST */
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Compact Go Up Navigation Card */}
                  <div
                    onClick={() => navigateToFolder(null)}
                    className="p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center text-center h-[110px] transition-all duration-200 group relative"
                  >
                    <div className="text-2xl text-yellow-500 opacity-60 group-hover:opacity-100 transition-opacity">
                      📁
                    </div>
                    <span className="text-xs font-bold text-secondary mt-2 group-hover:text-primary">
                      .. (Back to Root)
                    </span>
                  </div>

                  {sortedFiles.map(doc => renderFileGridCard(doc))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: PDF VIEWER & READER FRAME (SPAN 7) */}
        <div className={`${activeMobileTab === 'reader' ? 'block' : 'hidden lg:block'} ${isFullscreen ? 'lg:col-span-12' : 'lg:col-span-7'} w-full animate-fade-in`}>
          {selectedDoc ? (
            <div className="glass-card p-4 sm:p-5 space-y-4 border border-white/[0.08] shadow-2xl">
              
              {/* PDF Document Viewer Toolbar */}
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5 flex-wrap">
                <div className="min-w-0 flex items-center gap-2">
                  
                  {/* Back to Explorer for Mobile Only */}
                  <button
                    onClick={() => setActiveMobileTab('explorer')}
                    className="lg:hidden px-2.5 py-1.5 bg-study hover:bg-study-dark text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-glow-study flex-shrink-0"
                  >
                    ⬅ Explorer
                  </button>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-primary truncate max-w-[130px] sm:max-w-[200px]" title={selectedDoc.title}>
                      📄 {selectedDoc.title}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-muted mt-0.5">
                      Dir: <span className="text-study font-bold">{selectedDoc.category || 'General'}</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-secondary hover:text-primary transition-all border border-white/[0.04] flex items-center gap-1 cursor-pointer ml-1 sm:ml-3 self-center h-7 font-bold flex-shrink-0"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Reader Mode"}
                  >
                    <span>{isFullscreen ? '🗜️' : '⛶'}</span>
                    <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
                  </button>
                </div>
                
                {/* Page Progress Editor (Automatic Slider/Save Progress) */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap bg-white/[0.02] border border-white/[0.06] rounded-xl px-2.5 py-1.5 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-[11px] font-semibold text-secondary flex items-center gap-1">
                    Pg: <span className="text-primary font-sans font-bold">{selectedDoc.current_page || 0}</span> / <span className="text-muted font-sans font-medium">{selectedDoc.total_pages}</span>
                  </span>
                  
                  {/* Step Buttons & Slider */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const target = Math.max(1, pageInput - 1);
                        setPageInput(target);
                        triggerAutoSave(target);
                      }}
                      disabled={pageInput <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-lg text-sm font-bold text-primary disabled:opacity-20 disabled:pointer-events-none cursor-pointer border border-white/[0.04]"
                      title="Previous Page"
                    >
                      -
                    </button>
                    
                    {/* Range Slider */}
                    <input
                      type="range"
                      min="1"
                      max={selectedDoc.total_pages || 1}
                      value={pageInput}
                      onChange={handleSliderChange}
                      className="w-20 sm:w-32 accent-study cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                      title="Slide to change page"
                    />
                    
                    <button
                      onClick={() => {
                        const target = Math.min(selectedDoc.total_pages, pageInput + 1);
                        setPageInput(target);
                        triggerAutoSave(target);
                      }}
                      disabled={pageInput >= selectedDoc.total_pages}
                      className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-lg text-sm font-bold text-primary disabled:opacity-20 disabled:pointer-events-none cursor-pointer border border-white/[0.04]"
                      title="Next Page"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[10px] font-extrabold text-study font-sans bg-study/10 px-2 py-1 rounded border border-study/20">
                    {selectedDoc.total_pages ? Math.round((selectedDoc.current_page / selectedDoc.total_pages) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Inline PDF Viewer Frame */}
              {selectedDoc.pdf_file_url ? (
                <div className={`rounded-xl overflow-hidden border border-white/[0.08] bg-surface relative transition-all duration-300 w-full ${
                  isFullscreen 
                    ? 'h-[76vh]' 
                    : 'h-[66vh] sm:h-[480px] lg:h-[480px]'
                }`}>
                  <iframe
                    src={`${selectedDoc.pdf_file_url}#page=${iframePage}`}
                    className="w-full h-full border-none"
                    title={selectedDoc.title}
                  />
                </div>
              ) : (
                <div className="p-16 text-center text-xs text-muted border border-dashed border-border rounded-xl">
                  Cannot load PDF document URL. Please check connection.
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-24 text-center text-xs text-secondary border border-white/[0.06] shadow-2xl flex flex-col items-center justify-center">
              <span className="text-5xl block mb-3 drop-shadow-[0_0_12px_rgba(147,51,234,0.3)]">📚</span>
              <p className="font-bold text-sm text-primary">No Document Selected</p>
              <p className="text-muted mt-1 max-w-xs text-center">
                Select a PDF file inside folders on the left (or toggle Explorer) to launch the interactive viewer.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  // Helper renderer: Grid PDF file card (Simplified vertical layout with custom PDF logo)
  function renderFileGridCard(doc) {
    const isSelected = selectedDoc?.id === doc.id;
    return (
      <div
        key={doc.id}
        onClick={() => handleSelectDocument(doc)}
        className={`p-3 rounded-xl border flex flex-col items-center justify-center h-[110px] cursor-pointer transition-all duration-200 relative group
          ${isSelected ? 'bg-study/15 border-study/50 shadow-glow-study scale-[1.01]' : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/10'}`}
      >
        {/* Delete row button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete PDF "${doc.title}"?`)) {
              deleteDoc.mutate(doc.id);
              if (selectedDoc?.id === doc.id) setSelectedDoc(null);
            }
          }}
          disabled={deleteDoc.isPending}
          className="absolute top-1.5 right-1.5 p-1 bg-black/40 hover:bg-red-500/20 text-muted hover:text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-all text-[8px] border border-white/[0.04] cursor-pointer z-10"
          title="Delete file"
        >
          ✕
        </button>

        {/* Content: PDF Logo & File Title */}
        <div className="flex flex-col items-center text-center space-y-1.5 min-w-0 w-full">
          <PDFIcon />
          <span 
            className="text-[11px] font-bold text-primary block truncate w-full group-hover:text-study transition-colors px-1" 
            title={doc.title}
          >
            {doc.title}
          </span>
        </div>
      </div>
    );
  }
}
