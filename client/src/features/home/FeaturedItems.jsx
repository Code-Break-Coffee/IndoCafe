import React from 'react';
import MenuCard from '../../components/ui/MenuCard';
import Button from '../../components/ui/Button';
import { featuredItems } from '../../data/mockData';

const FeaturedItems = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Our Signature Dishes</h2>
          <p className="text-secondary max-w-2xl mx-auto">
            Discover the most loved dishes from our kitchen, crafted with passion and authentic ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="primary" className="px-8 py-3 text-lg">
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
