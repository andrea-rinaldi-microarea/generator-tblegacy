IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[<%= tableName %>Details]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[<%= tableName %>Details] (
<%if (defaultFields) { -%>
    [DocID] [int] NOT NULL ,
    [DocSubID] [int] NOT NULL ,
    [Code] [varchar] (12) NULL CONSTRAINT DF_<%= tableBaseName %>_Code_00 DEFAULT(''),
    [Description] [varchar] (128) NULL CONSTRAINT DF_<%= tableBaseName %>_Descriptio_00 DEFAULT (''),
<% } -%>
    CONSTRAINT [PK_<%= tableBaseName %>Details] PRIMARY KEY NONCLUSTERED
    (
<%if (defaultFields) { -%>
     [DocID],
     [DocSubID]
<% } -%>
    ) ON [PRIMARY],
   CONSTRAINT [FK_<%= tableName %>Details_<%= tableName %>_00] FOREIGN KEY
	(
<%if (defaultFields) { -%>
		[DocID]
<% } -%>
	) REFERENCES [dbo].[<%= tableName %>] (
<%if (defaultFields) { -%>
		[DocID]
<% } -%>
	)
) ON [PRIMARY]

END
GO

