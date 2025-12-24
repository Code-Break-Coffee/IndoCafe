import React from 'react';
import Button from './Button';

const MenuCard = ({ item }) => {
  return (
    <div className="bg-surface rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-secondary/10">
      <div className="h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-text">{item.name}</h3>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
            {item.category}
          </span>
        </div>
        <p className="text-secondary text-sm mb-4 flex-grow">{item.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-bold text-text">${item.price}</span>
          <Button variant="outline" className="text-sm px-4 py-1">Add</Button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
