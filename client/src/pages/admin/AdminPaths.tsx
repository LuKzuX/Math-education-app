import axios from 'axios'
import { useState } from 'react'
import { useAuth } from '../../context/authContext'
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as HiIcons from 'react-icons/hi';
import * as BiIcons from 'react-icons/bi';
function AdminPaths() {
  // 1. Explicitly type your libraries object
  const allIconLibraries: Record<string, Record<string, React.ComponentType<{ size?: number }>>> = {
    fa: FaIcons,
    md: MdIcons,
    hi: HiIcons,
    bi: BiIcons,
  };

  const [selectedIcon, setSelectedIcon] = useState("")
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pathIcon, setPathIcon] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !description || !pathIcon) {
      console.log("Please fill all fields and select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('path_icon', pathIcon);

      const response = await axios.post("/mathly/paths", formData, {
        headers: {
          Authorization: `Bearer ${user}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Upload successful:", response.data);
    } catch (error) {
      console.log("Upload failed:", error);
    }
  }

  // 2. Map through the object keys and values safely
  const filteredIcons = Object.entries(allIconLibraries).map(([libPrefix, libIcons]) => {
    const matchingNames = Object.keys(libIcons)
      .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 20);

    // Keep track of the prefix so we know which library to pull from later
    return {
      libPrefix,
      matchingNames
    };
  });

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 md:px-8 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header with skewed cyan blade */}
        <div className="relative pl-5 mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 -skew-x-12" />
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Manage Paths
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create a new learning path</p>
        </div>

        {/* Form card */}
        <div className="bg-[#0f1629] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder="Short tagline shown on the path picker"
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Icon
            </label>
            <input
              type="text"
              placeholder="Search icons (e.g. 'book', 'calculator')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />

            {/* Icon grid */}
            <div className="flex flex-wrap gap-2 mt-3 max-h-56 overflow-y-auto pr-1">
              {filteredIcons.map(({ libPrefix, matchingNames }) => {
                return matchingNames.map((iconName) => {
                  const IconComponent = allIconLibraries[libPrefix][iconName];
                  const isSelected = selectedIcon === iconName;

                  if (!IconComponent) return null;

                  return (
                    <button
                      key={iconName}
                      type="button"
                      title={iconName}
                      onClick={() => {
                        setSelectedIcon(iconName);
                        setPathIcon(iconName);
                      }}
                      className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${isSelected
                          ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                          : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                        }`}
                    >
                      <IconComponent size={20} />
                    </button>
                  );
                });
              })}
            </div>

            {selectedIcon && (
              <p className="mt-2 text-xs text-slate-500">
                Selected: <span className="font-['JetBrains_Mono'] text-cyan-300">{selectedIcon}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto mt-2 px-6 py-2.5 rounded-lg bg-cyan-400 text-[#0a0f1e] text-sm font-semibold font-['Space_Grotesk'] tracking-wide hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-[#0f1629] transition-colors"
          >
            Create path
          </button>
        </div>
      </div>
    </div>
  );

}

export default AdminPaths;
