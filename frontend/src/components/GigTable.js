import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MultiSelect } from 'react-multi-select-component';
import '../css/index.css';

const GigTable = () => {
  const [gigs, setGigs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('0');
  const [weekendsOnly, setWeekendsOnly] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    day: true,
    date: true,
    artist: true,
    type: true,
    venue: true,
    location: true,
    added: true,
    interested: true,
  });
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [currentGigId, setCurrentGigId] = useState(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    day: '',
    date: '',
    artist: '',
    type: [],
    venue: '',
    location: '',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/gigs')
      .then(response => setGigs(response.data))
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch gigs data.');
      });
  }, []);

  const getDateRange = (filterTerm) => {
    const now = new Date();
    switch (filterTerm) {
      case '1': // This week
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return [startOfWeek, endOfWeek];
      case '2': // This month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return [startOfMonth, endOfMonth];
      case '3': // Next month
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        return [startOfNextMonth, endOfNextMonth];
      case '4': // This year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        return [startOfYear, endOfYear];
      case '5': // Next year
        const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);
        const endOfNextYear = new Date(now.getFullYear() + 1, 11, 31);
        return [startOfNextYear, endOfNextYear];
      default:
        return [null, null];
    }
  };

  const filteredGigs = gigs.filter(gig => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm = (
      (gig.artist && gig.artist.toLowerCase().includes(searchTermLower)) ||
      (Array.isArray(gig.type) ? gig.type.some(type => type.toLowerCase().includes(searchTermLower)) : gig.type.toLowerCase().includes(searchTermLower)) ||
      (gig.venue && gig.venue.toLowerCase().includes(searchTermLower)) ||
      (gig.location && gig.location.toLowerCase().includes(searchTermLower))
    );

    const gigDate = new Date(gig.date);
    const [startDate, endDate] = getDateRange(filterTerm);
    const matchesFilterTerm = !startDate || (gigDate >= startDate && gigDate <= endDate);

    const matchesWeekendsOnly = !weekendsOnly || (gigDate.getDay() === 5 || gigDate.getDay() === 6);

    return matchesSearchTerm && matchesFilterTerm && matchesWeekendsOnly;
  });

  const handleRowClick = (gig) => {
    setSelectedGig(gig);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGig(null);
  };

  const handleColumnVisibilityChange = (column) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [column]: !prevState[column]
    }));
  };

  const handleAddInterest = (gigId) => {
    if (!userName) {
      setCurrentGigId(gigId);
      setIsNameModalOpen(true);
    } else {
      addInterestToGig(gigId, userName);
    }
  };

  const addInterestToGig = (gigId, name) => {
    setGigs(prevGigs => prevGigs.map(gig => {
      if (gig.id === gigId) {
        return {
          ...gig,
          interested: gig.interested ? [...gig.interested, { name }] : [{ name }]
        };
      }
      return gig;
    }));
  };

  const handleNameSubmit = () => {
    localStorage.setItem('userName', userName);
    addInterestToGig(currentGigId, userName);
    setIsNameModalOpen(false);
  };

  const handleAddEvent = () => {
    setIsAddEventModalOpen(true);
  };

  const handleAddEventSubmit = () => {
    axios.post('http://localhost:5000/gigs', newEvent)
      .then(response => {
        setGigs([...gigs, response.data]);
        setIsAddEventModalOpen(false);
        setNewEvent({
          day: '',
          date: '',
          artist: '',
          type: [],
          venue: '',
          location: '',
        });
      })
      .catch(error => {
        console.error('Error adding event:', error);
        alert('Failed to add event.');
      });
  };

  const handleDateChange = (date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    setNewEvent({ ...newEvent, date: date.toISOString().split('T')[0], day: dayOfWeek });
  };

  const options = [
    { label: "Gig", value: "Gig" },
    { label: "Club", value: "Club" },
    { label: "One-Day Festival", value: "One-Day Festival" },
    { label: "Full-On Festival", value: "Full-On Festival" },
  ];

  const handleTypeChange = (selected) => {
    setNewEvent({ ...newEvent, type: selected.map(option => option.value) });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  return (
    <div className="overflow-x-auto px-10 py-10 bg-white dark:bg-neutral-700">
        <div className="inline-flex rounded-md shadow-sm" role="group">
  <button onClick={handleAddEvent}type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
    <svg className="w-3 h-3 me-2" fill="#000000" version="1.1" id="Capa_1" viewBox="0 0 32.75 32.75">
      <g>
        <g>
          <path d="M29.375,1.25h-1.123c0.029-0.093,0.059-0.186,0.059-0.289c0-0.53-0.432-0.961-0.963-0.961s-0.961,0.431-0.961,0.961
            c0,0.103,0.028,0.196,0.059,0.289h-3.68c0.029-0.093,0.059-0.186,0.059-0.289C22.823,0.431,22.393,0,21.861,0
            C21.331,0,20.9,0.431,20.9,0.961c0,0.103,0.029,0.196,0.059,0.289h-3.682c0.029-0.093,0.059-0.186,0.059-0.289
            c0-0.53-0.43-0.961-0.961-0.961c-0.531,0-0.961,0.431-0.961,0.961c0,0.103,0.028,0.196,0.058,0.289h-3.681
            c0.029-0.093,0.059-0.186,0.059-0.289C11.85,0.431,11.419,0,10.889,0c-0.531,0-0.962,0.431-0.962,0.961
            c0,0.103,0.028,0.196,0.058,0.289h-3.68c0.03-0.093,0.059-0.186,0.059-0.289C6.364,0.43,5.934,0,5.403,0
            C4.872,0,4.441,0.431,4.441,0.961c0,0.103,0.028,0.196,0.058,0.289H3.375c-1.518,0-2.75,1.233-2.75,2.75v26
            c0,1.518,1.232,2.75,2.75,2.75H26.27l5.855-5.855V4C32.125,2.483,30.893,1.25,29.375,1.25z M30.625,26.273l-0.311,0.311h-2.355
            c-1.102,0-2,0.9-2,2v2.355l-0.311,0.311H3.375c-0.689,0-1.25-0.561-1.25-1.25V5h28.5V26.273z"/>
          <polygon points="15.049,23.682 17.701,23.682 17.701,19.701 21.68,19.701 21.68,17.049 17.701,17.049 17.701,13.069 
            15.049,13.069 15.049,17.049 11.07,17.049 11.07,19.701 15.049,19.701 		"/>
          <path d="M16.376,28.229c5.433,0,9.853-4.42,9.853-9.854c0-5.434-4.42-9.854-9.853-9.854c-5.434,0-9.854,4.42-9.854,9.854
            C6.522,23.809,10.942,28.229,16.376,28.229z M16.376,10.037c4.597,0,8.337,3.741,8.337,8.338c0,4.598-3.74,8.338-8.337,8.338
            c-4.598,0-8.339-3.74-8.339-8.338C8.037,13.778,11.778,10.037,16.376,10.037z"/>
        </g>
      </g>
    </svg>
    Add Event
  </button>
  <button
    type="button"
    id="dropdownDefaultButton"
    onClick={toggleDropdown}
    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
  >
    <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"/>
    </svg>
    Toggle Columns
    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
          </svg>
  </button>
  <button
    type="button"
    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
    onClick={toggleFilterDropdown}
  >
    <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
      <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
    </svg>
    Filter Gigs
  </button>
  <div className="relative mx-5">
            <label htmlFor="inputSearch" className="sr-only">Search</label>
            <input
              id="inputSearch"
              type="text"
              placeholder="Search..."
              className="block w-64 rounded-lg border dark:border-none dark:bg-neutral-600 py-2 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 text-neutral-500 dark:text-neutral-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
          </div>
</div>
      
      
      <div className="relative mb-4">
        {isDropdownOpen && (
          <div id="dropdown" className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-auto dark:bg-gray-700" style={{ top: '100%', left: 0 }}>
            <ul className="flex py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
              {Object.keys(visibleColumns).map(column => (
                <li key={column} className="px-2">
                  <div className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    <input
                      type="checkbox"
                      id={column}
                      checked={visibleColumns[column]}
                      onChange={() => handleColumnVisibilityChange(column)}
                    />
                    <label htmlFor={column} className="ml-2 capitalize">{column}</label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="relative mb-4">
        {isFilterDropdownOpen && (
          <div id="filterDropdown" className="h-32 w-1/4 p-2 absolute inset-0 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow mx-auto dark:bg-gray-700">
          <h2 className="text-xl mb-4">Filter Gigs</h2>
          <div className="flex items-center space-x-4">
            <div className="relative m-[2px] mb-3 float-right">
              <label htmlFor="weekendsOnly" className="sr-only">Weekends Only</label>
              <input
                id="weekendsOnly"
                type="checkbox"
                className="mr-2"
                checked={weekendsOnly}
                onChange={e => setWeekendsOnly(e.target.checked)}
              />
              <label htmlFor="weekendsOnly" className="text-sm">Weekends Only</label>
            </div>
            <div className="relative m-[2px] mb-3 float-right">
              <label htmlFor="inputFilter" className="sr-only">Filter</label>
              <select
                id="inputFilter"
                className="block w-40 rounded-lg border dark:border-none dark:bg-neutral-600 p-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={filterTerm}
                onChange={e => setFilterTerm(e.target.value)}
              >
                <option value="0">Any date</option>
                <option value="1">This week</option>
                <option value="2">This month</option>
                <option value="3">Next month</option>
                <option value="4">This Year</option>
                <option value="5">Next Year</option>
              </select>
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="flex justify-center items-center min-h-screen">
        <div className="w-4xl">
          <table className="text-left text-base whitespace-nowrap max-w-4xl">
            <thead className="uppercase tracking-wider border-b-2 dark:border-neutral-600 border-t">
              <tr>
                {visibleColumns.day && <th scope="col" className="px-2 py-3 border-x dark:border-neutral-600">Day</th>}
                {visibleColumns.date && <th scope="col" className="px-2 py-3 border-x dark:border-neutral-600">Date</th>}
                {visibleColumns.artist && <th scope="col" className="px-2 py-3 border-x dark:border-neutral-600">Artist</th>}
                {visibleColumns.type && <th scope="col" className="px-2 py-3 border-x dark:border-neutral-600">Type</th>}
                {visibleColumns.venue && <th scope="col" className="px-2 py-3 border-x dark:border-neutral-600">Venue</th>}
                {visibleColumns.location && <th scope="col" className="px-2 py-3 border-x dark:border-neutral-600">Location</th>}
                {visibleColumns.added && <th scope="col" className="px-2 py-3 border-x dark:border-neutral-600">Added</th>}
                {visibleColumns.interested && <th scope="col" className="px-2 py-3 border-x dark:border-neutral-600">Interested</th>}
              </tr>
            </thead>
            <tbody>
              {filteredGigs.map(gig => (
                <tr key={gig.id} className="border-b dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-600 cursor-pointer" onClick={() => handleRowClick(gig)}>
                  {visibleColumns.day && <th scope="row" className="px-2 py-3 border-x dark:border-neutral-600">{gig.day}</th>}
                  {visibleColumns.date && <td className="px-2 py-3 border-x dark:border-neutral-600">{gig.date}</td>}
                  {visibleColumns.artist && (
                    <td className="px-2 py-3 border-x dark:border-neutral-600" title={gig.artist}>
                      {gig.artist.length > 20 ? `${gig.artist.substring(0, 20)}...` : gig.artist}
                    </td>
                  )}
                  {visibleColumns.type && <td className="px-2 py-3 border-x dark:border-neutral-600">{Array.isArray(gig.type) ? gig.type.join(', ') : gig.type}</td>}
                  {visibleColumns.venue && <td className="px-2 py-3 border-x dark:border-neutral-600">{gig.venue}</td>}
                  {visibleColumns.location && <td className="px-2 py-3 border-x dark:border-neutral-600">{gig.location}</td>}
                  {visibleColumns.added && <td className="px-2 py-3 border-x dark:border-neutral-600">{gig.added ? gig.added.name : 'N/A'}</td>}
                  {visibleColumns.interested && <td className="px-2 py-3 border-x dark:border-neutral-600">
                    {gig.interested ? gig.interested.map(interestedPerson => interestedPerson.name).join(', ') : 'N/A'}
                    <button onClick={(e) => { e.stopPropagation(); handleAddInterest(gig.id); }} className="ml-2 text-blue-500">+</button>
                    </td>
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedGig && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-neutral-700 p-5 rounded-lg relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-xl">&times;</button>
            <h2 className="text-xl mb-4">{selectedGig.artist}</h2>
            <p><strong>Date:</strong> {selectedGig.date}</p>
            <p><strong>Type:</strong> {selectedGig.type.join(', ')}</p>
            <p><strong>Venue:</strong> {selectedGig.venue}</p>
            <p><strong>Location:</strong> {selectedGig.location}</p>
            <p><strong>Added By:</strong> {selectedGig.added ? selectedGig.added.name : 'N/A'}</p>
            <p><strong>Interested:</strong> {selectedGig.interested ? selectedGig.interested.map(person => person.name).join(', ') : 'N/A'}</p>
            <button onClick={closeModal} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
          </div>
        </div>
      )}

      {isNameModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-neutral-700 p-5 rounded-lg relative">
            <button onClick={() => setIsNameModalOpen(false)} className="absolute top-2 right-2 text-xl">&times;</button>
            <h2 className="text-xl mb-4">Enter Your Name</h2>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="block w-full p-2 mb-4 border rounded"
            />
            <button onClick={handleNameSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
          </div>
        </div>
      )}

      {isAddEventModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-neutral-700 p-5 rounded-lg relative">
            <button onClick={() => setIsAddEventModalOpen(false)} className="absolute top-2 right-2 text-xl">&times;</button>
            <h2 className="text-xl mb-4">Add New Event</h2>
            <DatePicker
              selected={newEvent.date ? new Date(newEvent.date) : null}
              onChange={handleDateChange}
              className="block w-full p-2 mb-4 border rounded"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select a date"
            />
            <input
              type="text"
              placeholder="Artist"
              value={newEvent.artist}
              onChange={(e) => setNewEvent({ ...newEvent, artist: e.target.value })}
              className="block w-full p-2 mb-4 border rounded"
            />
            <MultiSelect
              options={options}
              value={options.filter(option => newEvent.type.includes(option.value))}
              onChange={handleTypeChange}
              labelledBy="Select Type"
              className="block w-full p-2 mb-4 border rounded"
              hasSelectAll={false}
              disablePreSelectedValues={true}
              overrideStrings={{
                selectSomeItems: "Select Type",
                allItemsAreSelected: "All types are selected",
                selectAll: "Select All",
                search: "Search",
              }}
            />
            <input
              type="text"
              placeholder="Venue"
              value={newEvent.venue}
              onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
              className="block w-full p-2 mb-4 border rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="block w-full p-2 mb-4 border rounded"
            />
                        
            <button onClick={handleAddEventSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Add Event</button>






          </div>
        </div>
      )}

    </div>
  );
};

export default GigTable;