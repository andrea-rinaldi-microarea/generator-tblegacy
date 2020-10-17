IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[<%= tableName %>]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[<%= tableName %>] (
<%if (defaultFields) { -%>
    [DocID] [int] NOT NULL ,
    [DocSubID] [int] NOT NULL ,
    [Code] [varchar] (12) NULL CONSTRAINT DF_<%= tableBaseName %>_Code_00 DEFAULT(''),
    [Description] [varchar] (128) NULL CONSTRAINT DF_<%= tableBaseName %>_Descriptio_00 DEFAULT (''),
<% } -%>
    CONSTRAINT [PK_<%= tableBaseName %>] PRIMARY KEY NONCLUSTERED
    (
<%if (defaultFields) { -%>
     [DocID],
     [DocSubID]
<% } -%>
    ) ON [PRIMARY],
   CONSTRAINT [FK_<%= tableName %>_<%= masterTableName %>_00] FOREIGN KEY
	(
<%if (defaultFields) { -%>
		[DocID]
<% } -%>
	) REFERENCES [dbo].[<%= masterTableName %>] (
<%if (defaultFields) { -%>
		[DocID]
<% } -%>
	)
) ON [PRIMARY]

END
GO

