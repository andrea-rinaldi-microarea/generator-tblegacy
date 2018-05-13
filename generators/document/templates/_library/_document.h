
#pragma once

#include <<%= moduleName %>\<%= componentsName %>\ADM<%= documentName %>.h>

#include "beginh.dex"

class <%= tableName %>;

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

//=============================================================================
class TB_EXPORT D<%= documentName %> : public CAbstractFormDoc, public ADM<%= documentName %>Obj
{
	DECLARE_DYNCREATE(D<%= documentName %>)

public:
	D<%= documentName %>();
	DBT<%= documentName %>*		m_pDBT<%= documentName %>;
	
public:	// function Member
	virtual	<%= tableName %>*	Get<%= tableBaseName %>() const;                        
	// interfaccia ADM
	virtual	ADMObj*		GetADM		()	{ return this; }

protected:
	virtual BOOL	OnAttachData	();
};

#include "endh.dex"
