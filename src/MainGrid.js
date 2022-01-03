import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Table } from "./Table";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import update from "immutability-helper";
import DataArray from "@mui/icons-material/DataArray";
import { ListItem, List, AppBar, Toolbar, Box, Chip } from "@mui/material";
import interpret from "./Interpreter";

const theme = createTheme({
  palette: {
    background: {
      default: "#202120",
    },
    card: {
      light: "#e3e3e3",
      dark: "#0a0a0a",
    },
  },
});

class MainGrid extends React.Component {
  constructor(props) {
    super(props);

    this.saveColumn = this.saveColumn.bind(this);
    this.state = {
      cards: [
        new Table(
          "1",
          "tableOne",
          JSON.parse(`{ 
            "1": "id : uuid default gen_uuid() ( PK )", 
            "2": "organisation_id : uuid NOT NULL ( FK - organisation.id ) | SELECT,UPDATE |" 
          }`)
        ),
        new Table(
          "2",
          "tableTwo",
          JSON.parse(`{
            "1": "id : uuid default gen_uuid() ( PK )",
            "2": "filename : text NOT NULL"
          }`)
        ),
      ],
    };
  }

  /**
   * Saves the new column value into the state array
   * @param {*} event
   * @param {*} card
   */
  saveTitle(event, card) {
    var res = this.state.cards.find((element) => element.id === card.id);
    res.title = event.target.value;
    this.setState({
      cards: update(this.state.cards, { $merge: res }),
    });
  }

  /**
   * Saves the new column value into the state array
   * @param {*} event
   * @param {*} card
   */
  saveColumn(event, card) {
    var res = this.state.cards.find((element) => element.id === card.id);
    var newVal = { [event.target.id]: event.target.value };
    res.columns = { ...res.columns, ...newVal };
    this.setState({
      cards: update(this.state.cards, { $merge: res }),
    });
  }

  /**
   * Adds a column to the object in the state array
   * @param {*} card
   */
  addColumn(card) {
    var res = this.state.cards.find((element) => element.id === card.id);
    var newCol = { [Math.random()]: "" };
    res.columns = { ...res.columns, ...newCol };
    this.setState({
      cards: update(this.state.cards, { $merge: res }),
    });
  }

  /**
   * Add a new table object to the state array
   */
  generateTable() {
    this.setState({
      cards: [
        ...this.state.cards,
        new Table(Math.random(), "", {
          [Math.random()]: "",
        }),
      ],
    });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <main>
          <AppBar position="sticky">
            <Toolbar variant="regular">
              <DataArray sx={{ mr: 1 }} />
              <Typography variant="h6" color="inherit" noWrap paddingRight={3}>
                PostgreSQL Table Generator
              </Typography>
              <Box>
                <Button
                  size="large"
                  variant="contained"
                  color="success"
                  sx={{ mr: 3 }}
                  onClick={() => {
                    this.generateTable();
                  }}
                >
                  Add new table
                </Button>
                <Button
                  size="large"
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    interpret(this.state.cards);
                    alert("Data copied to clipboard!");
                  }}
                >
                  Export Data
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            spacing={4}
            paddingTop={4}
            paddingLeft={4}
            paddingRight={4}
            paddingBottom={4}
          >
            {this.state.cards.map((card) => (
              <Grid item key={card.id}>
                <Box>
                  <Card
                    // raised="true"
                    variant="outlined"
                    sx={{
                      bgcolor: "card.light",
                      display: "flex",
                      height: "auto",
                      width: "auto",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <CardContent
                      sx={{ flexGrow: 1, flexShrink: 1, flexWrap: 1 }}
                    >
                      <Box pb={1}>
                        <Divider>
                          <Chip label="Table Name" />
                        </Divider>
                      </Box>
                      <TextField
                        variant="outlined"
                        multiline
                        fullWidth
                        placeholder="Insert table name here..."
                        defaultValue={card.title}
                        onChange={(e) => {
                          this.saveTitle(e, card);
                        }}
                      ></TextField>
                      <Box pt={1}>
                        <Divider>
                          <Chip label="Columns" />
                        </Divider>
                      </Box>
                      <List dense={true}>
                        {Object.entries(card.columns).map(([key, value]) => (
                          <ListItem key={key}>
                            <TextField
                              id={key}
                              variant="outlined"
                              multiline
                              fullWidth
                              placeholder="Insert column data here..."
                              defaultValue={value}
                              onChange={(e) => {
                                this.saveColumn(e, card);
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="large"
                        onClick={() => {
                          this.addColumn(card);
                        }}
                      >
                        Add Column
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </main>
      </ThemeProvider>
    );
  }
}

export default MainGrid;
