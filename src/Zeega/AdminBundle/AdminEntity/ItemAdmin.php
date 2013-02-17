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
        $fileLoc = realpath("lastExport.txt");
		$lastExport = strtotime(file_get_contents($fileLoc));
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
            ->add('date_created', 'date', array('required' => false, 'widget' => 'single_text', 'help' => 'Last Export Date: ' . $lastExport . '\n If created after this date, has not been sent to IA', 
                  'attr' => array('readonly' => true)))

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
			->add('id')
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
			->add('media_creator_username')
        ;
    }

	public function getTemplate($name)
    {
        switch ($name) {
            case 'edit':
                return 'ZeegaAdminBundle::edit.html.twig';
                break;
            default:
                return parent::getTemplate($name);
                break;
        }
    }
}
