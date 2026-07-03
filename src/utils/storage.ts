import Taro from '@tarojsimport Taro from '@tarojs/timport Taro from '@tarojs/taro';
import type { Bill, Category }import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
constimport Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name:import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type:import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: 'import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: '交通', icon: '🚗', type: 'expense', sort: 2 },
  { id: '3', name: 'import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: '交通', icon: '🚗', type: 'expense', sort: 2 },
  { id: '3', name: '购物', icon: '🛍️', type: 'import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: '交通', icon: '🚗', type: 'expense', sort: 2 },
  { id: '3', name: '购物', icon: '🛍️', type: 'expense', sort: 3 },
  { id: '4', name: '娱乐import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: '交通', icon: '🚗', type: 'expense', sort: 2 },
  { id: '3', name: '购物', icon: '🛍️', type: 'expense', sort: 3 },
  { id: '4', name: '娱乐', icon: '🎮', type: 'expense', sort: 4 },
  {import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: '交通', icon: '🚗', type: 'expense', sort: 2 },
  { id: '3', name: '购物', icon: '🛍️', type: 'expense', sort: 3 },
  { id: '4', name: '娱乐', icon: '🎮', type: 'expense', sort: 4 },
  { id: '5', name: '医疗',import Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: '交通', icon: '🚗', type: 'expense', sort: 2 },
  { id: '3', name: '购物', icon: '🛍️', type: 'expense', sort: 3 },
  { id: '4', name: '娱乐', icon: '🎮', type: 'expense', sort: 4 },
  { id: '5', name: '医疗', icon: '🏥', type: 'expenseimport Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: '交通', icon: '🚗', type: 'expense', sort: 2 },
  { id: '3', name: '购物', icon: '🛍️', type: 'expense', sort: 3 },
  { id: '4', name: '娱乐', icon: '🎮', type: 'expense', sort: 4 },
  { id: '5', name: '医疗', icon: '🏥', type: 'expense', sort: 5 },
  { id: '6', name: '教育', iconimport Taro from '@tarojs/taro';
import type { Bill, Category } from '@/types';

const BILLS_KEY = 'bill-app-bills';
const CATEGORIES_KEY = 'bill-app-categories';

const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', type: 'expense', sort: 1 },
  { id: '2', name: '交通', icon: '🚗', type: 'expense', sort: 2 },
  { id: '3', name: '购物', icon: '🛍️', type: 'expense', sort: 3 },
  { id: '4', name: '娱乐', icon: '🎮', type: 'expense', sort: 4 },
  { id: '5', name: '医疗', icon: '🏥', type: 'expense', sort: 5 },
  { id: '6', name: '教育', icon: '📚', type: 'expense', sort: 6 },
  { id: