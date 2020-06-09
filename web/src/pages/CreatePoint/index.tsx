//Placa Decodificador Usb Mp3 Bluetooth + Amplificador Estéreo - Tecnotronics
import React,{useState, useEffect, ChangeEvent, FormEvent} from 'react';
import './styles.css';
import {Link, useHistory} from 'react-router-dom';
import logo from '../../assets/logo.svg';
import {FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';
import axios from 'axios';


interface IItem{
  id:number,
  title:string,
  image_url:string
}

interface IUf{
  id:number,
  nome:string,
  sigla:string
}

interface ICitys{
  nome:string
}

const CreatePoint: React.FC = () => {
  const [items, setItem] = useState<IItem[]>([]);
  const [ufs, setUfs] = useState<IUf[]>([]);
  const [formdata,setFormData] = useState({name:'',email:'',whatsapp:''});
  const [citys, setCitys] = useState<string[]>([])
  const [selectedUf,setSelectedUf] = useState('0')
  const [selectedCity,setSelectedCity] = useState('0')
  const [seletedPosition,SetSeletedPosition] = useState<[number,number]>([0,0])
  const [initialPosition,SetInitialPosition] = useState<[number,number]>([0,0])
  const [seletedItems,setSeletedItems] = useState<number[]>([]);
  const history = useHistory();

  useEffect( () => {
    navigator.geolocation.getCurrentPosition( position => {
      const { latitude, longitude} = position.coords;
      SetInitialPosition([latitude, longitude]);
    }) 
  })

  useEffect( () => {
    api.get('items').then( response => {
      setItem(response.data);     
    });
  }, [items])

  useEffect( () => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then( response => {
      setUfs(response.data);
    })
  },[selectedUf])

  useEffect( () => {

    if(selectedUf === '0'){
      return;
    }

    axios.get<ICitys[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then( response => {
      const citysNames = response.data.map(city => city.nome);
      setCitys(citysNames);
    })
  },[selectedUf])


  function handleSelectedUf(event:ChangeEvent<HTMLSelectElement>){

    const uf = event.target.value
    setSelectedUf(uf);
  }

  function handleSelectedCity(event:ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleSeletedPosition(event:LeafletMouseEvent){
    const {lat, lng} = event.latlng
    SetSeletedPosition([lat,lng]);
  }

  function handleInputChange(event:ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target;
    setFormData({...formdata,[name]:value})
  }

  function handleSelectedItem(id:number){
    const alreadySelected = seletedItems.findIndex(item => item === id);

    if(alreadySelected >= 0){
      const filteredItems = seletedItems.filter(item => item !== id);
      setSeletedItems(filteredItems);
    }else{
      setSeletedItems([...seletedItems,id]);
    }
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault();
    const { name, email, whatsapp } = formdata;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = seletedPosition;
    const items = seletedItems;
    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items

    }

    await api.post('points', data);

    alert('ponto de coleta criado');

    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
            type="text"
            name="name"
            id="name"
            onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

            <Map center={initialPosition} zoom={15} onClick={handleSeletedPosition}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={seletedPosition} zoom={15} />
            </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                name="uf" 
                id="uf" 
                value={selectedUf} 
                onChange={handleSelectedUf}>
                <option value="0">Selecione um UF</option>
                {ufs.map( uf => (  
                  <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                <option value="0">Selecione uma cidade</option>
                {citys.map( city => (
                  <option key={city} value={city}>{city}</option>
                ))}
                
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítems de coleta</h2>
            <span>Selecione um uo mais item abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
              <li 
                key={String(item.id)} 
                onClick={() => handleSelectedItem(item.id)}
                className={seletedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
            </li>
            ))}
            
            
          </ul>
        </fieldset>
        <button type="submit">Cadastra ponto de coleta</button>

      </form>
    </div>
  );
}

export default CreatePoint;