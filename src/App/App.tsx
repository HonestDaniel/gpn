import React, { BaseSyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ReactECharts } from '../Echarts/ReactECharts';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import styles from './App.module.scss';

enum CurrencyEnum {
  USD = 'Курс доллара',
  EUR = 'Курс евро',
  CNY = 'Курс юаня',
}

interface CurrencyData {
  date: string;
  month: string;
  indicator: string;
  value: number;
}

function App(): JSX.Element {

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyEnum>(CurrencyEnum.USD);
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [options, setOptions] = useState<any>({});

  const selectedCurrencySymbol: Record<CurrencyEnum, string> = useMemo(() => ({
    [CurrencyEnum.USD]: '$',
    [CurrencyEnum.EUR]: '€',
    [CurrencyEnum.CNY]: '¥',
  }), [])

  const generateOption = useCallback(() => ({
    title: {
      text: `${selectedCurrency}, ${selectedCurrencySymbol[selectedCurrency]}/₽`.toUpperCase(), // не знаю почему, но к символу рубля шрифт не применяется...
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    xAxis: {
      type: 'category',
      data: currencyData.map(item => item.month),
    },
    yAxis: {
      type: 'value',
    },
    series: [{
      name: selectedCurrency,
      type: 'line',
      color: '#F38B00',
      showSymbol: false,
      data: currencyData.map(item => item.value),
    }],
  }), [currencyData, selectedCurrency, selectedCurrencySymbol]);

  useEffect(() => {
    // Функция для загрузки данных о валютах с API
    const fetchData = async () => {
      try {
        const response = await fetch(`https://65d367ac522627d50108d35f.mockapi.io/Currencies?indicator=${encodeURIComponent(selectedCurrency)}`);
        const data = await response.json();
        setCurrencyData(data);
        setAverage(Number((data.reduce((acc: number, item: CurrencyData) => {
          return acc + item.value
        }, 0) / data.length).toFixed(2)));
        console.log(average);
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };

    fetchData();
  }, [selectedCurrency, average]);

  useEffect(() => {
    // Генерация объекта option при изменении данных о валютах
    if (currencyData.length > 0) {
      setOptions(generateOption());
    }
  }, [currencyData, selectedCurrency, generateOption]);

  const onSetCurrency = (item: {e: BaseSyntheticEvent; value: string}) => {
    switch (item.value) {
      case '$': setSelectedCurrency(CurrencyEnum.USD);
        break;
      case '€': setSelectedCurrency(CurrencyEnum.EUR);
        break;
      case '¥': setSelectedCurrency(CurrencyEnum.CNY);
        break;
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chart}>
        <ReactECharts option={options}></ReactECharts>
        <div className={styles.panel}>
          <ChoiceGroup
            value={selectedCurrencySymbol[selectedCurrency]}
            items={['$', '€', '¥']}
            name='Currencies'
            getItemLabel={(item: string) => item}
            onChange={onSetCurrency}></ChoiceGroup>
          <div className={styles.panel_calc}>
            <div className={styles.panel_calc_text}>Среднее за период</div>
            <div className={styles.panel_calc_value}>
              {average}
              <span className={styles.panel_calc_value_symbol}>₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
