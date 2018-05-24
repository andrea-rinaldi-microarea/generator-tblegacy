
#pragma once

#include <<%= moduleName %>\<%= componentsName %>\ADM<%= documentName %>.h>

#include "beginh.dex"

class <%= tableName %>;
class <%= tableName %>Details;

//////////////////////////////////////////////////////////////////////////////
//             class DBT<%= documentName %> definition
//////////////////////////////////////////////////////////////////////////////
//
//----------------------------------------------------------------------------
class TB_EXPORT DBT<%= documentName %> : public DBTMaster
{ 
	DECLARE_DYNAMIC (DBT<%= documentName %>)

public:
	DBT<%= documentName %> (CRuntimeClass*, CAbstractFormDoc*);

public:
	<%= tableName %>* Get<%= tableBaseName %> () const { return (<%= tableName %>*) GetRecord(); }

protected: 
	virtual void	OnEnableControlsForFind		();
	virtual void	OnDisableControlsForEdit	();
	
	virtual	void	OnDefineQuery		();
	virtual	void	OnPrepareQuery		();
	virtual	void	OnPrepareBrowser	(SqlTable* pTable);
	
	virtual	BOOL	OnCheckPrimaryKey	();
	virtual	void	OnPreparePrimaryKey	() {}
};

//////////////////////////////////////////////////////////////////////////////
//             class DBT<%= documentName %>Details definition
//////////////////////////////////////////////////////////////////////////////
//
//----------------------------------------------------------------------------
class TB_EXPORT DBT<%= documentName %>Details : public DBTSlaveBuffered
{ 
	DECLARE_DYNAMIC (DBT<%= documentName %>Details)

public:
	DBT<%= documentName %>Details (CRuntimeClass*, CAbstractFormDoc*);

public:
	<%= tableName %>* 			Get<%= tableBaseName %> () 			const { return (<%= tableName %>*)m_pDocument->GetMaster()->GetRecord(); }
	<%= tableName %>Details*	GetDetail 				(int nRow)	const { return (<%= tableName %>Details*) GetRow(nRow); }

protected: 
	virtual	void	OnDefineQuery		();
	virtual	void	OnPrepareQuery		();

	virtual	BOOL	OnCheckPrimaryKey	();
	virtual	void	OnPreparePrimaryKey	(int nRow, SqlRecord* pRec);
};

//=============================================================================
class TB_EXPORT D<%= documentName %> : public CAbstractFormDoc, public ADM<%= documentName %>Obj
{
	DECLARE_DYNCREATE(D<%= documentName %>)

public:
	D<%= documentName %>();
	DBT<%= documentName %>*			m_pDBT<%= documentName %>;
	DBT<%= documentName %>Details*	m_pDBTDetail;
	
public:
	virtual	<%= tableName %>*			Get<%= tableBaseName %>	() 			const;
	virtual	<%= tableName %>Details*	GetDetail				(int nRow)	const;
                       
	// ADM Interface
	virtual	ADMObj*		GetADM		()	{ return this; }

protected:
	virtual BOOL	OnAttachData	();
};

#include "endh.dex"
