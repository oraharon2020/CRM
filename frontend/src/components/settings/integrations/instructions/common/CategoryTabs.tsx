import React from 'react';

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: React.ReactNode;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  const getTabColor = (category: Category, isActive: boolean) => {
    if (!category.color) return isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
    
    switch (category.color) {
      case 'blue':
        return isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
      case 'green':
        return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
      case 'red':
        return isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
      case 'yellow':
        return isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
      case 'indigo':
        return isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800';
      case 'purple':
        return isActive ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';
      case 'pink':
        return isActive ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800';
      default:
        return isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mb-6">
      <div className="sm:hidden">
        <select
          id="category-tabs-mobile"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={activeCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
            {categories.map((category) => {
              const isActive = category.id === activeCategory;
              const tabColor = getTabColor(category, isActive);
              
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`
                    whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm rounded-t-md
                    ${isActive 
                      ? `border-blue-500 ${tabColor}` 
                      : 'border-transparent hover:border-gray-300 hover:bg-gray-50'}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center">
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
