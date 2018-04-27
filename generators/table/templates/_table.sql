if not exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[<%= tableName %>]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
 BEGIN
CREATE TABLE [dbo].[<%= tableName %>] (
    [Code] [varchar] (10) NOT NULL,
    [Description] [varchar] (128) NULL CONSTRAINT DF_<%= tableName %>_Descriptio_00 DEFAULT ('')
   CONSTRAINT [PK_<%= tableName %>] PRIMARY KEY NONCLUSTERED 
    (
        [Code]
    ) ON [PRIMARY]
) ON [PRIMARY]

END
GO
