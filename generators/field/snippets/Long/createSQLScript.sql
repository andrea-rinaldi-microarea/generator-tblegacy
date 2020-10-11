<% if (isPK) { -%>
[<%= fieldName %>] [int] NOT NULL,
<% } else { -%>
[<%= fieldName %>] [int] NULL CONSTRAINT DF_<%= tableBaseName %>_<%= fieldName %>_00 DEFAULT(0),
<% } -%>
