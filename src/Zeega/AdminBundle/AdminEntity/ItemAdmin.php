<?php

namespace Zeega\AdminBundle\AdminEntity;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Validator\ErrorElement;
use Sonata\AdminBundle\Form\FormMapper;

class ItemAdmin extends Admin
{
    protected function configureFormFields(FormMapper $formMapper)
    {
		$itemTypes = array('Video' => 'Video', 'Audio' => 'Audio',
			'Text' => 'Text','Image' => 'Image','Tweet' => 'Tweet','Document' => 'Document',
			'Website' => 'Website');
        $formMapper
            ->add('title')
            ->add('description')
			->add('text')
			->add('uri')
			->add('attribution_uri')
			->add('media_type', 'choice', array('choices' => $itemTypes, 'multiple' => false))
			->add('media_geo_latitude')
			->add('media_geo_longitude')
			->add('location')
			->add('media_creator_username')
			->add('media_creator_realname')
			->add('tags', NULL, array('allow_add' => true, 'allow_delete' => true))
			->add('attributes', NULL, array('allow_add' => true, 'allow_delete' => true))
			->add('published')
        ;
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title')
            ->add('uri')
			->add('published')
            ->add('media_type')
			->add('media_creator_username')
        ;
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('id')
            ->add('title')
            ->add('media_type')
            ->add('date_created')
            ->add('published')
        ;
    }
}
