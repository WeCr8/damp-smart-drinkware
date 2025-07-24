/**
 * Reusable Category Slider Component
 * 
 * A horizontal scrollable list of category buttons with consistent styling
 */

import React from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View 
} from 'react-native';
import { ReactNode } from 'react';

export interface Category {
  id: string;
  name: string;
  icon: ReactNode;
}

interface CategorySliderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  containerStyle?: object;
  contentContainerStyle?: object;
}

export default function CategorySlider({
  categories,
  selectedCategory,
  onSelectCategory,
  containerStyle,
  contentContainerStyle
}: CategorySliderProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, containerStyle]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      testID="categories-container"
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategoryButton,
          ]}
          onPress={() => onSelectCategory(category.id)}
          accessibilityLabel={`Select ${category.name} category`}
          accessibilityRole="button"
          testID={`category-item${category.id !== 'all' ? `-${category.id}` : ''}`}
        >
          <View style={styles.iconContainer}>
            {category.icon}
          </View>
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.selectedCategoryButtonText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1F5FE',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  selectedCategoryButton: {
    backgroundColor: '#E1F5FE',
    borderColor: '#0277BD',
  },
  iconContainer: {
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64B5F6',
  },
  selectedCategoryButtonText: {
    color: '#0277BD',
    fontFamily: 'Inter-SemiBold',
  },
});