import React from 'react';
import Button from './Button';

const MenuCard = ({ item }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
          <span className="bg-orange-100 text-primary px-2 py-1 rounded-full text-xs font-semibold">
            {item.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{item.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-bold text-gray-900">${item.price}</span>
          <Button variant="outline" className="text-sm px-4 py-1">Add</Button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
