import React from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

interface MasonryGridProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  numColumns?: number;
  loading?: boolean;
}

export function MasonryGrid<T extends { id: string }>({ 
  data, 
  renderItem, 
  numColumns = 2,
  loading = false 
}: MasonryGridProps<T>) {
  // Create columns for masonry layout
  const createColumns = () => {
    const columns: T[][] = Array.from({ length: numColumns }, () => []);
    
    data.forEach((item, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push(item);
    });
    
    return columns;
  };

  const columns = createColumns();

  if (loading && data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A574" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {columns.map((column, columnIndex) => (
        <View key={columnIndex} style={styles.column}>
          {column.map((item, itemIndex) => (
            <View key={item.id} style={styles.itemContainer}>
              {renderItem({ item, index: itemIndex })}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
  },
  itemContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
});