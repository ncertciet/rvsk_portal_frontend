import { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import apiClient from '../../services/apiClient';

/**
 * RVSK-USR-MGMT-001.2/.3 — Role-conditional cascading geo selector.
 *
 * Reads /master-data/{states,districts,blocks} (view-backed). Options bind the
 * *_key (bigint as string) and display the *_name. The number of visible
 * dropdowns depends on the selected role's geo level.
 *
 * The parent owns the key state; this component reports changes upward and
 * clears dependent selections when a parent changes.
 */

export type GeoLevel = 'none' | 'state' | 'district' | 'block';

export interface GeoValue {
  stateKey: string;
  districtKey: string;
  blockKey: string;
}

interface Option {
  key: string;
  name: string;
}

interface Props {
  level: GeoLevel;
  value: GeoValue;
  onChange: (next: GeoValue) => void;
}

export function geoLevelForRole(role: string): GeoLevel {
  switch (role) {
    case 'State_Admin':
      return 'state';
    case 'District_Admin':
      return 'district';
    case 'Block_Admin':
      return 'block';
    default:
      return 'none';
  }
}

export default function GeoScopeSelect({ level, value, onChange }: Props) {
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [blocks, setBlocks] = useState<Option[]>([]);

  const showState = level !== 'none';
  const showDistrict = level === 'district' || level === 'block';
  const showBlock = level === 'block';

  // Load states once when any geo dropdown becomes visible.
  useEffect(() => {
    if (!showState) return;
    apiClient
      .get('/portal-masters/states')
      .then((r) => setStates(r.data || []))
      .catch(() => setStates([]));
  }, [showState]);

  // Load districts whenever the selected state changes.
  useEffect(() => {
    if (!showDistrict || !value.stateKey) {
      setDistricts([]);
      return;
    }
    apiClient
      .get('/portal-masters/districts', { params: { stateKey: value.stateKey } })
      .then((r) => setDistricts(r.data || []))
      .catch(() => setDistricts([]));
  }, [showDistrict, value.stateKey]);

  // Load blocks whenever the selected district changes.
  useEffect(() => {
    if (!showBlock || !value.districtKey) {
      setBlocks([]);
      return;
    }
    apiClient
      .get('/portal-masters/blocks', { params: { districtKey: value.districtKey } })
      .then((r) => setBlocks(r.data || []))
      .catch(() => setBlocks([]));
  }, [showBlock, value.districtKey]);

  if (level === 'none') return null;

  return (
    <>
      {showState && (
        <Grid item xs={12} sm={showDistrict ? 6 : 12}>
          <FormControl fullWidth required>
            <InputLabel>State</InputLabel>
            <Select
              value={value.stateKey}
              label="State"
              onChange={(e) =>
                // Changing state clears district + block (cascade reset).
                onChange({ stateKey: e.target.value as string, districtKey: '', blockKey: '' })
              }
            >
              <MenuItem value="">
                <em>Select State</em>
              </MenuItem>
              {states.map((s) => (
                <MenuItem key={s.key} value={s.key}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      {showDistrict && (
        <Grid item xs={12} sm={showBlock ? 6 : 6}>
          <FormControl fullWidth required disabled={!value.stateKey}>
            <InputLabel>District</InputLabel>
            <Select
              value={value.districtKey}
              label="District"
              onChange={(e) =>
                // Changing district clears block.
                onChange({ ...value, districtKey: e.target.value as string, blockKey: '' })
              }
            >
              <MenuItem value="">
                <em>Select District</em>
              </MenuItem>
              {districts.map((d) => (
                <MenuItem key={d.key} value={d.key}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      {showBlock && (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required disabled={!value.districtKey}>
            <InputLabel>Block</InputLabel>
            <Select
              value={value.blockKey}
              label="Block"
              onChange={(e) => onChange({ ...value, blockKey: e.target.value as string })}
            >
              <MenuItem value="">
                <em>Select Block</em>
              </MenuItem>
              {blocks.map((b) => (
                <MenuItem key={b.key} value={b.key}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
    </>
  );
}
