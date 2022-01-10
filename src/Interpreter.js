function interpret(tables) {
  var output = "";

  // Generate the tables
  tables.forEach(function (table) {
    // If table title is empty no need to bother even trying to add it
    if (!table.title) {
      return;
    }

    var temp = "";

    Object.entries(table.columns).forEach(([key, value]) => {
      try {
        if (value) {
          var name = value.split(":")[0].trim();
          var type = value.split(":")[1].trim().split(" ")[0];
          var def = value.split(":")[1].trim().split(" ")[1];
          var ault = value.split(":")[1].trim().split(" ")[2];

          if (
            value.substring(value.indexOf("( ") + 1, value.lastIndexOf(" )"))
          ) {
            if (
              value
                .substring(value.indexOf("( ") + 1, value.lastIndexOf(" )"))
                .trim() === "PK"
            ) {
              temp += `${name} ${type} PRIMARY KEY ${def} ${ault}, `;
            } else {
              temp += `${name} ${type} ${def} ${ault}, `;
            }
          } else {
            temp += `${name} ${type} ${def} ${ault}, `;
          }
        } else {
          return;
        }
      } catch (e) {
        console.log("Error with main table");
      }
    });

    output += `CREATE TABLE IF NOT EXISTS ${table.title} (${temp.slice(
      0,
      -2
    )}); `;
  });

  // Generate the permissions
  tables.forEach(function (table) {
    // If table title is empty no need to bother even trying to add it
    if (!table.title) {
      return;
    }

    var sel = "";
    var upd = "";
    var ins = "";
    var del = "";

    Object.entries(table.columns).forEach(([key, value]) => {
      try {
        if (value.substring(value.indexOf("|") + 1, value.lastIndexOf("|"))) {
          const grants = value
            .substring(value.indexOf("|") + 1, value.lastIndexOf("|"))
            .trim()
            .split(",");
          grants.forEach(function (grant) {
            switch (grant.trim()) {
              case "SELECT":
                sel += `${value.split(":")[0].trim()}, `;
                break;
              case "UPDATE":
                upd += `${value.split(":")[0].trim()}, `;
                break;
              case "INSERT":
                ins += `${value.split(":")[0].trim()}, `;
                break;
              case "DELETE":
                del += `${value.split(":")[0].trim()}, `;
                break;
              default:
                break;
            }
          });
        }

        if (sel) {
          output += `GRANT SELECT(${sel.slice(0, -2)}) ON ${
            table.title
          } TO graphile; `;
        }
        if (upd) {
          output += `GRANT UPDATE(${sel.slice(0, -2)}) ON ${
            table.title
          } TO graphile; `;
        }
        if (ins) {
          output += `GRANT INSERT(${sel.slice(0, -2)}) ON ${
            table.title
          } TO graphile; `;
        }
        if (del) {
          output += `GRANT DELETE(${sel.slice(0, -2)}) ON ${
            table.title
          } TO graphile; `;
        }
      } catch (e) {
        console.log("Error with permissions");
      }
    });
  });

  // Generate the foreign keys
  tables.forEach(function (table) {
    // If table title is empty no need to bother even trying to add it
    if (!table.title) {
      return;
    }

    Object.entries(table.columns).forEach(([key, value]) => {
      try {
        if (value.substring(value.indexOf("( ") + 1, value.lastIndexOf(" )"))) {
          if (value.split("( ")[1].substring(0, 2) === "FK") {
            var fk = value
              .substring(value.indexOf("FK - ") + 1, value.lastIndexOf(" )"))
              .split("- ")[1];
            output += `ALTER TABLE ${table.title} DROP CONSTRAINT IF EXISTS ${
              table.title
            }_table_${value.split(":")[0].trim()}_fk; `;
            output += `ALTER TABLE ${table.title} ADD CONSTRAINT ${
              table.title
            }_table_${value.split(":")[0].trim()}_fk FOREIGN KEY(${value
              .split(":")[0]
              .trim()}) REFERENCES ${fk.split(".")[0].trim()}(${fk
              .split(".")[1]
              .trim()}) ON DELETE RESTRICT; `;
          }
        }
      } catch (e) {
        console.log("Error with foreign keys");
      }
    });
  });

  // Generate the indexes
  tables.forEach(function (table) {
    // If table title is empty no need to bother even trying to add it
    if (!table.title) {
      return;
    }
    Object.entries(table.columns).forEach(([key, value]) => {
      try {
        var col = value.split(":")[0].trim();
        output += `DROP INDEX IF EXISTS ${table.title}_table_${col}_idx; `;
        output += `CREATE INDEX ${table.title}_table_${col}_idx ON ${table.title}(${col}); `;
      } catch (e) {
        console.log("Error with indexes");
      }
    });
  });

  // Enable the RLS
  tables.forEach(function (table) {
    output += `ALTER TABLE ${table.title} ENABLE ROW LEVEL SECURITY; `;
  });

  // Generate RLS policies
  tables.forEach(function (table) {
    // If table title is empty no need to bother even trying to add it
    if (!table.title) {
      return;
    }

    var sel = false;
    var upd = false;
    var ins = false;
    var del = false;

    Object.entries(table.columns).forEach(([key, value]) => {
      try {
        if (value.substring(value.indexOf("|") + 1, value.lastIndexOf("|"))) {
          const grants = value
            .substring(value.indexOf("|") + 1, value.lastIndexOf("|"))
            .trim()
            .split(",");
          grants.forEach(function (grant) {
            switch (grant.trim()) {
              case "SELECT":
                sel = true;
                break;
              case "UPDATE":
                upd = true;
                break;
              case "INSERT":
                ins = true;
                break;
              case "DELETE":
                del = true;
                break;
              default:
                break;
            }
          });
        }

        if (sel) {
          output += `DROP POLICY IF EXISTS ${table.title}_table_select_policy ON ${table.title}; `;
          output += `CREATE POLICY ${table.title}_table_select_policy ON ${table.title} FOR SELECT TO graphile USING ( true ); `;
        }
        if (upd) {
          output += `DROP POLICY IF EXISTS ${table.title}_table_update_policy ON ${table.title}; `;
          output += `CREATE POLICY ${table.title}_table_update_policy ON ${table.title} FOR UPDATE TO graphile USING ( true ) WITH CHECK ( true ); `;
        }
        if (ins) {
          output += `DROP POLICY IF EXISTS ${table.title}_table_insert_policy ON ${table.title}; `;
          output += `CREATE POLICY ${table.title}_table_insert_policy ON ${table.title} FOR INSERT TO graphile USING ( true ) WITH CHECK ( true ); `;
        }
        if (del) {
          output += `DROP POLICY IF EXISTS ${table.title}_table_delete_policy ON ${table.title}; `;
          output += `CREATE POLICY ${table.title}_table_delete_policy ON ${table.title} FOR DELETE TO graphile USING ( true ); `;
        }
      } catch (e) {
        console.log("Error with RLS policies");
      }
    });
  });

  console.log("Copied to clipboard:");
  console.log(output);

  const el = document.createElement("textarea");
  el.value = output;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export default interpret;
