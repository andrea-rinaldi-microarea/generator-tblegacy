<% if (isPK) { -%>
[<%= fieldName %>] [varchar] (<%= fieldLen %>) NOT NULL,
<% } else { -%>
[<%= fieldName %>] [varchar] (<%= fieldLen %>) NULL CONSTRAINT DF_<%= tableBaseName %>_<%= fieldName %>_00 DEFAULT (''),
<% } -%>
