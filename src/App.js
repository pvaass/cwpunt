import logo from './logo.svg';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNfc } from './services/nfc.js';
import {getList, addUser, updateUser, getUser} from './services/getUsers';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import './styles.css';

const theme = createTheme();

function App() {

  const { isNDEFAvailable, permission, read, abortReadCtrl, write, isScanning } = useNfc()
  const [list, setList] = useState([]);
  const [view, setView] = useState('list')
  const [currentTag, setCurrentTag] = useState('');
  const [currentScan, setCurrentScan] = useState({user: '', team: 0, points: 0, objectId: '', tagid: ''})

  const [form, setForm] = useState({
    name: "",
    team: ""
  });

  const onUpdateField = e => {
    const nextFormState = {
      ...form,
      [e.target.name]: e.target.value,
    };
    setForm(nextFormState);
  };

  const onSubmitForm = e => {
    e.preventDefault();

    // form.name, form.team

    addUser(form.name, form.team, currentTag).then(
      setView('scan')
    )
  };


  useEffect(() => {
    const query = new URLSearchParams(window.location.search.substring(1));
    const token = query.get('a')
    if(token === 'supergeheimzorgdatniemandditzietanderskunnenzezelfpuntjeserbijdoen') {
      setView('scan')
    }
    if(token === 'jan') {
      setView('scan')
    }
    getList()
      .then(items => {
        setList(items)
      })
    setInterval(() => {
      getList()
      .then(items => {
        setList(items)
      })
    },600000)
  }, [])
  
  const addPoints = (amount) => {
    const tag = getTagInfo(currentTag);

    updateUser(tag.objectId, tag.points + amount).then(() => {
      setView('scan')
    })
  }

  // decode an NFC tag containing a single record
  const handleRead = async () => {
    try {
      
      console.log('we scanning');
      const response = await read()

      abortReadCtrl();
      console.log('no more scan');
      setCurrentTag(response.serialNumber)
      getUser(response.serialNumber).then((userList) => {
        if (userList.length > 0) {  
          setCurrentScan(userList['0']);
        }
  
        console.log('userlist:')
        console.log(userList);
  
        if(userList.length > 0) {
          console.log('we have this');
          setView('edit')
        } else {
          console.log(list.map(i => i.tagid));
          console.log('we donut have this')
          setView('new')
        }
      })
    } catch (error) {
      console.log("ERROR ", error);
    }
  }
  

  const getTagInfo = (tagid) => {
    console.log(currentScan)
    return currentScan;
  }

  const scanView = (isNDEFAvailable, permission, isScanning) => {
    return (
      <>
        {isNDEFAvailable !== undefined && !isNDEFAvailable && (
          <div>Oh nee, dit werkt niet op jouw telefoon :(</div>
        )}
        {isNDEFAvailable && <Button
          variant="contained"
          size="large"
          onClick={handleRead}
          disabled={permission === 'denied'}
        >
          {isScanning ? 'Aan het scannen...' : 'Druk hier om te scannen'}
        </Button>}
      </>
    )
  }
  const editView = () => {
    const tag = getTagInfo(currentTag);
    return (
      <Card 
        sx={{
        minWidth: 275,
        
      }}>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <h1>{tag.user}</h1>
          <h2>{tag.points} punten</h2>

          <div>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(1)} >+1</Button>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(2)} >+2</Button>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(3)} >+3</Button>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(5)} >+5</Button>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(10)} >+10</Button>
          </div>
          <div style={{marginTop: 20}}>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(-1)} >-1</Button>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(-2)} >-2</Button>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(-3)} >-3</Button>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(-5)} >-5</Button>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => addPoints(-10)} >-10</Button>
          </div>
          <div style={{marginTop: 20}}>
            <Button sx={{margin:2}} variant="contained" size="large" onClick={() => setView('scan')}>Terug</Button>
          </div>
        </CardContent>
        
      </Card>
    )
  }

  const newView = () => {
    return (
      <>
        <h1>Nieuwe chip toevoegen</h1>
        <TextField id="outlined-basic" label="Naam" variant="outlined" value={form.name} name="name" onChange={onUpdateField} />
        <TextField id="outlined-basic" label="Team #" variant="outlined"  value={form.team} name="team" onChange={onUpdateField} />
        <Button sx={{margin:2}} variant="contained" size="large" onClick={onSubmitForm}>Ok</Button>
      </>
    )
  }

  const listView = () => {

    return (
      <>
           {list.map(item => (
              <ListItem disablePadding sx={{flex: '40%'}}>
                 <ListItemAvatar>
                    <Avatar>
                      {item.points}
                    </Avatar>
                  </ListItemAvatar>
                <ListItemButton>
                  <ListItemText primary={item.user} secondary={`Team ${item.team}`} />
                </ListItemButton>
              </ListItem>
           ))}
      </>
    )
  }


  if(view === 'list') {
    return (
      <ThemeProvider theme={theme}>
        <div style={{width: '1840px', margin: 40, overflowX: 'hidden', textAlign: 'center'}}>
          <img src="https://cwp.nu/themes/cwp/assets/images/logo.png" style={{marginBottom: 15}} />
          <List sx={{display: 'flex', width: '1920px', flexDirection: 'row', flexWrap: 'wrap'}}>
          { view === 'list' && listView()}
          </List>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            '& .MuiTextField-root': { m: 1 }
          }}
        > 
          { view === 'scan' && scanView(isNDEFAvailable, permission, isScanning)}
          { view === 'new' && newView()}
          { view === 'edit' && editView()}
      </Box>
    </Container>
  </ThemeProvider>
     
  );
}

export default App;
