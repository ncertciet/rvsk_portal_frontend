import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  academicYear: string;
  stateId: string;
  districtId: string;
  blockId: string;
  schoolId: string;
}

const initialState: FilterState = {
  academicYear: '',
  stateId: '',
  districtId: '',
  blockId: '',
  schoolId: '',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setStateFilter(state, action: PayloadAction<string>) {
      state.stateId = action.payload;
      state.districtId = '';
      state.blockId = '';
      state.schoolId = '';
    },
    setDistrictFilter(state, action: PayloadAction<string>) {
      state.districtId = action.payload;
      state.blockId = '';
      state.schoolId = '';
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setStateFilter, setDistrictFilter, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
