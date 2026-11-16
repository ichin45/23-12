import { DateVibeItem } from '../types';
import { getDishNumberByDate } from '../utils/dishNumber';
import rawDishes from './dishes.json';

export const INITIAL_DISHES: DateVibeItem[] = (rawDishes as unknown as DateVibeItem[]).map((dish) => ({
  ...dish,
  dishNumber: dish.dishNumber ? String(dish.dishNumber) : getDishNumberByDate(dish.date),
}));
