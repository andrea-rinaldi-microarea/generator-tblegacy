IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[<%= tableName %>]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[<%= tableName %>] (
<%if (defaultFields) { -%>
    [DocID] [int] NOT NULL ,
    [DocNo] [varchar] (10) NULL CONSTRAINT DF_<%= tableBaseName %>_DocNo_00 DEFAULT (''),
    [DocDate] [datetime] NULL CONSTRAINT DF_<%= tableBaseName %>_DocDate_00  DEFAULT('17991231'),
	[LastSubId] [int] NULL CONSTRAINT DF_<%= tableBaseName %>_LastSubId_00 DEFAULT(0),
<% } -%>
    CONSTRAINT [PK_<%= tableBaseName %>] PRIMARY KEY NONCLUSTERED
    (
<%if (defaultFields) { -%>
     [DocID]
<% } -%>
    ) ON [PRIMARY]
) ON [PRIMARY]

END
GO
