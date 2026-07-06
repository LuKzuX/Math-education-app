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
    <div>
      <h1>Manage paths</h1>
      <input className='border' type='text' onChange={(e) => setTitle(e.target.value)} placeholder='title'></input>
      <input className='border' type='text' onChange={(e) => setDescription(e.target.value)} placeholder='desc'></input>
      <input
        type="text"
        placeholder="Search icons (e.g., 'book', 'calculator')..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border p-2 rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button className='border' onClick={handleSubmit}>submit</button>

      {/* 3. Render icons dynamically based on their specific library prefix */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filteredIcons.map(({ libPrefix, matchingNames }) => {
          return matchingNames.map((iconName) => {
            // Pull dynamically from the correct library using its prefix
            const IconComponent = allIconLibraries[libPrefix][iconName];
            const isSelected = selectedIcon === iconName;

            // Guard clause in case an icon component is missing
            if (!IconComponent) return null;

            return (
              <button
                key={iconName}
                type="button"
                title={iconName}
                onClick={() => {
                  setSelectedIcon(iconName)
                  setPathIcon(iconName)
                }}
                className={`p-2 border rounded flex items-center justify-center hover:bg-blue-50 transition-colors ${isSelected
                    ? 'border-blue-600 bg-blue-100 text-blue-600 ring-2 ring-blue-400'
                    : 'border-gray-200 text-gray-600'
                  }`}
              >
                <IconComponent size={20} />
              </button>
            );
          });
        })}
      </div>
    </div>
  )
}

export default AdminPaths;
