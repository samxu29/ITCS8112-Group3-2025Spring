import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ExcelUpload from "./ExcelUpload";

const Record = (props) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => props.onSelect(props.record._id)}
        className="h-4 w-4 rounded border-gray-300"
      />
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.record.name}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.record.position}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.record.level}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to={`/edit/${props.record._id}`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
          color="red"
          type="button"
          onClick={() => {
            props.deleteRecord(props.record._id);
          }}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState(new Set());
  const [availableLevels, setAvailableLevels] = useState(new Set());
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLevelDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // This method fetches the records from the database.
  useEffect(() => {
    async function getRecords() {
      const response = await fetch(`http://localhost:5050/record/`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const records = await response.json();
      setRecords(records);
      setFilteredRecords(records);
      
      // Extract unique levels from records
      const levels = new Set(records.map(record => record.level));
      setAvailableLevels(levels);
    }
    getRecords();
    return;
  }, [records.length]);

  // Handle search and level filtering
  useEffect(() => {
    let filtered = records;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.name.toLowerCase().includes(searchTermLower) ||
        record.position.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply level filter
    if (selectedLevels.size > 0) {
      filtered = filtered.filter(record => selectedLevels.has(record.level));
    }

    setFilteredRecords(filtered);
  }, [searchTerm, records, selectedLevels]);

  // Handle level selection
  const toggleLevel = (level) => {
    const newSelectedLevels = new Set(selectedLevels);
    if (newSelectedLevels.has(level)) {
      newSelectedLevels.delete(level);
    } else {
      newSelectedLevels.add(level);
    }
    setSelectedLevels(newSelectedLevels);
  };

  // This method will delete a record
  async function deleteRecord(id) {
    try {
      const response = await fetch(`http://localhost:5050/record/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newRecords = records.filter((el) => el._id !== id);
      setRecords(newRecords);
      
      // Also remove the id from selectedRecords if it was selected
      if (selectedRecords.has(id)) {
        const newSelected = new Set(selectedRecords);
        newSelected.delete(id);
        setSelectedRecords(newSelected);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  }

  // This method will delete multiple records
  async function deleteSelectedRecords() {
    if (selectedRecords.size === 0) return;
    
    try {
      const response = await fetch(`http://localhost:5050/record/bulk`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: Array.from(selectedRecords)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the records list by filtering out deleted records
      const newRecords = records.filter(record => !selectedRecords.has(record._id));
      setRecords(newRecords);
      setSelectedRecords(new Set()); // Clear selection
    } catch (error) {
      console.error("Error deleting records:", error);
    }
  }

  // Handle individual record selection
  const handleSelect = (id) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRecords.size === records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(records.map(record => record._id)));
    }
  };

  // This method will map out the records on the table
  function recordList() {
    return filteredRecords.map((record) => {
      return (
        <Record
          record={record}
          deleteRecord={() => deleteRecord(record._id)}
          isSelected={selectedRecords.has(record._id)}
          onSelect={handleSelect}
          key={record._id}
        />
      );
    });
  }

  // This following section will display the table with the records of individuals.
  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Employee Records</h3>
          <div className="flex gap-2">
            {selectedRecords.size > 0 && (
              <button
                onClick={deleteSelectedRecords}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-500 text-white hover:bg-red-600 h-9 rounded-md px-3"
              >
                Delete Selected ({selectedRecords.size})
              </button>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-green-500 text-white hover:bg-green-600 h-9 rounded-md px-3"
            >
              Upload Excel
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    <input
                      type="checkbox"
                      checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Position
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                      className="inline-flex items-center gap-1 hover:text-blue-500 focus:outline-none"
                    >
                      Level
                      {selectedLevels.size > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 ml-1">
                          {selectedLevels.size}
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 transition-transform ${isLevelDropdownOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isLevelDropdownOpen && (
                      <div className="absolute left-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border z-10">
                        <div className="px-3 py-2 border-b">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Filter by Level</span>
                            {selectedLevels.size > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLevels(new Set());
                                }}
                                className="text-xs text-blue-500 hover:text-blue-700"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                        </div>
                        {Array.from(availableLevels).map(level => (
                          <label
                            key={level}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLevels.has(level)}
                              onChange={() => toggleLevel(level)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{level}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&amp;_tr:last-child]:border-0">
                {recordList()}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                {records.length === 0 ? 'No records found' : 'No matching records found'}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <ExcelUpload
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            const getRecords = async () => {
              const response = await fetch(`http://localhost:5050/record/`);
              if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
              }
              const records = await response.json();
              setRecords(records);
              // Update available levels when new records are added
              const levels = new Set(records.map(record => record.level));
              setAvailableLevels(levels);
            };
            getRecords();
          }}
        />
      )}
    </>
  );
}
