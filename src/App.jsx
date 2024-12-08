import Background from './components/Background';
import ProductTable from './components/ProductTable';
import SearchBox from './components/SearchBox';

function App() {
  return (
    <Background>
      <SearchBox />
      <ProductTable />
    </Background>
  );
}

export default App;
