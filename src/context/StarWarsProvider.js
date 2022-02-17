import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import StarWarsContext from './StarWarsContext';
import fetchPlanets from '../services/fetchPlanets';

function StarWarsContextProvider({ children }) {
  const [name, setName] = useState('');
  const [storedPlanets, setStoredPlanets] = useState([]);
  const [planets, setPlanets] = useState([]);
  const [filterByNumericValues, setfilterByNumericValues] = useState([]);
  const [planetsWithFilter, setPlanetsWithFilter] = useState([]);
  const [column, setColumn] = useState('population');
  const [comparison, setComparison] = useState('maior que');
  const [value, setValue] = useState('0');
  const [columnOptions, setColumnOptions] = useState([
    'population',
    'orbital_period',
    'diameter',
    'rotation_period',
    'surface_water',
  ]);
  const [columnSort, setColumnSort] = useState('name');
  const [directionSort, setDirectionSort] = useState('ASC');
  const [ordered, setOrdered] = useState([]);

  function handleName({ target }) { setName(target.value.toLowerCase()); }
  function handleColumn({ target }) { setColumn(target.value); }
  function handleComparison({ target }) { setComparison(target.value); }
  function handleValue({ target }) { setValue(target.value); }
  function addFilter() {
    const newFilter = [...filterByNumericValues, { column, comparison, value }];
    setfilterByNumericValues(newFilter);
    const newColumnOptions = columnOptions.filter((item) => item !== column);
    setColumnOptions(newColumnOptions);
    setColumn(columnOptions[0]);
  }

  function deleteFilter(columnName) {
    const newFilterList = filterByNumericValues
      .filter((item) => item.column !== columnName);
    setfilterByNumericValues(newFilterList);
  }

  function handleSortColumn({ target }) { setColumnSort(target.value); }
  function handleSortDirection({ target }) { setDirectionSort(target.value); }
  function sortPlanetList(planetList) {
    const planetsSorted = planetList.sort((a, b) => {
      let result = {};
      const test = a[columnSort] === 'unknown'
        ? null
        : Number.isNaN(Number(a[columnSort]));
      if (test) {
        result = directionSort === 'ASC'
          ? a[columnSort].localeCompare(b[columnSort])
          : b[columnSort].localeCompare(a[columnSort]);
      }
      else {
        result = directionSort === 'ASC'
          ? a[columnSort] - b[columnSort]
          : b[columnSort] - a[columnSort];
      }
      return result;
    });
    return planetsSorted;
  }

  // A função sortPlanetList foi referência (consultada) do PR do Rogério Lambert: https://github.com/tryber/sd-010-a-project-starwars-planets-search/pull/38
  // Referência 2: https://ricardo-reis.medium.com/o-m%C3%A9todo-sort-do-array-javascript-482576734e0a#:~:text=O%20m%C3%A9todo%20sort()%20permite,e%20o%20maior%20por%20%C3%BAltimo.

  function sortPlanetList(planetList) {
    const planetsSorted = planetList.sort((a, b) => {
      let result = {};
      const test = a[columnSort] === 'unknown'
        ? null
        : Number.isNaN(Number(a[columnSort]));
      if (test) {
        result = directionSort === 'ASC'
         ? a[columnSort] === b[columnSort] ? 0 
         : a[columnSort] > b[columnSort] ? 1 : -1 
         : a[columnSort] < b[columnSort] ? 1 : -1;
      }
      else {
        result = directionSort === 'ASC'
          ? a[columnSort] - b[columnSort]
          : b[columnSort] - a[columnSort];
      }
      return result;
    });
    return planetsSorted;
  }

  function handleSortBtn() {
    setOrdered(sortPlanetList(planets));
    console.log(ordered);
  }

  useEffect(() => {
    const apiResults = async () => {
      const results = await fetchPlanets();
      setStoredPlanets(results);
      setPlanets(sortPlanetList(results));
    };
    apiResults();
  }, []);

  useEffect(() => {
    const filterPlanets = (filterByNumericValues.length === 0)
      ? storedPlanets.filter((planet) => planet.name.toLowerCase().includes(name))
      : planetsWithFilter.filter((planet) => planet.name.toLowerCase().includes(name));
    setPlanets(filterPlanets);
  }, [name, planetsWithFilter]);

  useEffect(() => {
    filterByNumericValues.forEach((filterName) => {
      const newPlanets = planets.filter((item) => {
        if (item[filterName.column] === 'unknown') return false;
        if (filterName.comparison === 'maior que') {
          return parseInt(item[filterName.column], 10) > parseInt(filterName.value, 10);
        }
        if (filterName.comparison === 'menor que') {
          return parseInt(item[filterName.column], 10) < parseInt(filterName.value, 10);
        }
        if (filterName.comparison === 'igual a') {
          return parseInt(item[filterName.column], 10) === parseInt(filterName.value, 10);
        }
        return null;
      });
      setPlanetsWithFilter(newPlanets);
      console.log(ordered);
    });
    if (filterByNumericValues.length === 0) setPlanetsWithFilter([]);
  }, [filterByNumericValues]);

  const contextValue = {
    filters: {
      filterByName: {
        name,
      },
      filterByNumericValues,
    },
    function: {
      handleName,
      handleColumn,
      handleComparison,
      handleValue,
      addFilter,
      deleteFilter,
      handleSortColumn,
      handleSortDirection,
      handleSortBtn,
    },
    planets,
    ordered,
    inputsValues: {
      column,
      comparison,
      value,
      columnSort,
      directionSort,
    },
    columnOptions,
  };

  return (
    <StarWarsContext.Provider value={ contextValue }>
      {children}
    </StarWarsContext.Provider>
  );
}
StarWarsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export default StarWarsContextProvider;
